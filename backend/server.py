from dotenv import load_dotenv
from pathlib import Path
import os

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, UploadFile, File, Header, Query
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import Response as StarletteResponse
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from bson import ObjectId
import logging
import uuid
import bcrypt
import jwt
import requests
import asyncio

# MongoDB
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

JWT_ALGORITHM = "HS256"
APP_NAME = "remax-active-broker"
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
MIME_TYPES = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
              "gif": "image/gif", "webp": "image/webp"}

# ---------------- Auth helpers ----------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]

def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email,
               "exp": datetime.now(timezone.utc) + timedelta(hours=12), "type": "access"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Nepřihlášeno")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="Uživatel nenalezen")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Platnost tokenu vypršela")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Neplatný token")

# ---------------- Storage helpers ----------------
storage_key = None

def init_storage():
    global storage_key
    if storage_key:
        return storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key

def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(f"{STORAGE_URL}/objects/{path}",
                        headers={"X-Storage-Key": key, "Content-Type": content_type},
                        data=data, timeout=120)
    resp.raise_for_status()
    return resp.json()

def get_object(path: str):
    key = init_storage()
    resp = requests.get(f"{STORAGE_URL}/objects/{path}",
                        headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

# ---------------- Models ----------------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class AgentModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    role: str = "Realitní makléř"
    bio: str = ""
    phone: str = ""
    email: str = ""
    photo_url: str = ""
    order: int = 0

class AgentCreate(BaseModel):
    name: str
    role: str = "Realitní makléř"
    bio: str = ""
    phone: str = ""
    email: str = ""
    photo_url: str = ""
    order: int = 0

class PropertyModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str = ""
    price: int = 0
    currency: str = "Kč"
    deal_type: str = "prodej"  # prodej | pronajem
    property_type: str = "byt"  # byt | dum | pozemek | komercni
    status: str = "aktivni"  # aktivni | rezervovano | prodano
    location: str = ""
    bedrooms: int = 0
    bathrooms: int = 0
    area: int = 0
    images: List[str] = []
    featured: bool = False
    agent_id: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class PropertyCreate(BaseModel):
    title: str
    description: str = ""
    price: int = 0
    currency: str = "Kč"
    deal_type: str = "prodej"
    property_type: str = "byt"
    status: str = "aktivni"
    location: str = ""
    bedrooms: int = 0
    bathrooms: int = 0
    area: int = 0
    images: List[str] = []
    featured: bool = False
    agent_id: Optional[str] = None

class ContactMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str = ""
    message: str
    property_id: Optional[str] = None
    is_read: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str = ""
    message: str
    property_id: Optional[str] = None

# ---------------- Auth routes ----------------
@api_router.post("/auth/login")
async def login(body: LoginRequest, response: Response):
    email = body.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Nesprávný e-mail nebo heslo")
    token = create_access_token(str(user["_id"]), email)
    response.set_cookie(key="access_token", value=token, httponly=True,
                        secure=True, samesite="none", max_age=43200, path="/")
    return {"id": str(user["_id"]), "email": email, "name": user.get("name", "Admin"), "role": user.get("role")}

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"message": "Odhlášeno"}

@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return {"id": user["_id"], "email": user["email"], "name": user.get("name"), "role": user.get("role")}

# ---------------- Upload routes ----------------
@api_router.post("/upload")
async def upload(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else "bin"
    content_type = MIME_TYPES.get(ext, file.content_type or "application/octet-stream")
    path = f"{APP_NAME}/uploads/{uuid.uuid4()}.{ext}"
    data = await file.read()
    result = await asyncio.to_thread(put_object, path, data, content_type)
    await db.files.insert_one({
        "id": str(uuid.uuid4()), "storage_path": result["path"],
        "original_filename": file.filename, "content_type": content_type,
        "size": result.get("size", len(data)), "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat()})
    return {"url": f"/api/files/{result['path']}"}

@api_router.get("/files/{path:path}")
async def download(path: str):
    record = await db.files.find_one({"storage_path": path, "is_deleted": False})
    if not record:
        raise HTTPException(status_code=404, detail="Soubor nenalezen")
    data, content_type = await asyncio.to_thread(get_object, path)
    return StarletteResponse(content=data, media_type=record.get("content_type", content_type))

# ---------------- Agents routes ----------------
@api_router.get("/agents")
async def list_agents():
    agents = await db.agents.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return agents

@api_router.post("/agents")
async def create_agent(body: AgentCreate, user: dict = Depends(get_current_user)):
    agent = AgentModel(**body.model_dump())
    await db.agents.insert_one(agent.model_dump())
    return agent

@api_router.put("/agents/{agent_id}")
async def update_agent(agent_id: str, body: AgentCreate, user: dict = Depends(get_current_user)):
    res = await db.agents.update_one({"id": agent_id}, {"$set": body.model_dump()})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Makléř nenalezen")
    updated = await db.agents.find_one({"id": agent_id}, {"_id": 0})
    return updated

@api_router.delete("/agents/{agent_id}")
async def delete_agent(agent_id: str, user: dict = Depends(get_current_user)):
    await db.agents.delete_one({"id": agent_id})
    return {"message": "Smazáno"}

# ---------------- Properties routes ----------------
@api_router.get("/properties")
async def list_properties(deal_type: Optional[str] = None, property_type: Optional[str] = None,
                          featured: Optional[bool] = None):
    q = {}
    if deal_type:
        q["deal_type"] = deal_type
    if property_type:
        q["property_type"] = property_type
    if featured is not None:
        q["featured"] = featured
    props = await db.properties.find(q, {"_id": 0}).sort("created_at", -1).to_list(500)
    return props

@api_router.get("/properties/{property_id}")
async def get_property(property_id: str):
    prop = await db.properties.find_one({"id": property_id}, {"_id": 0})
    if not prop:
        raise HTTPException(status_code=404, detail="Nemovitost nenalezena")
    return prop

@api_router.post("/properties")
async def create_property(body: PropertyCreate, user: dict = Depends(get_current_user)):
    prop = PropertyModel(**body.model_dump())
    await db.properties.insert_one(prop.model_dump())
    return prop

@api_router.put("/properties/{property_id}")
async def update_property(property_id: str, body: PropertyCreate, user: dict = Depends(get_current_user)):
    res = await db.properties.update_one({"id": property_id}, {"$set": body.model_dump()})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Nemovitost nenalezena")
    updated = await db.properties.find_one({"id": property_id}, {"_id": 0})
    return updated

@api_router.delete("/properties/{property_id}")
async def delete_property(property_id: str, user: dict = Depends(get_current_user)):
    await db.properties.delete_one({"id": property_id})
    return {"message": "Smazáno"}

# ---------------- Contact routes ----------------
def send_notification_email(msg: ContactMessage):
    api_key = os.environ.get("RESEND_API_KEY")
    if not api_key:
        logger.info("RESEND_API_KEY not set, skipping email notification")
        return
    try:
        import resend
        resend.api_key = api_key
        html = f"""
        <h2>Nová zpráva z webu RE/MAX Active Broker</h2>
        <p><strong>Jméno:</strong> {msg.name}</p>
        <p><strong>E-mail:</strong> {msg.email}</p>
        <p><strong>Telefon:</strong> {msg.phone}</p>
        <p><strong>Nemovitost:</strong> {msg.property_id or '-'}</p>
        <p><strong>Zpráva:</strong></p>
        <p>{msg.message}</p>
        """
        resend.Emails.send({
            "from": os.environ.get("SENDER_EMAIL", "onboarding@resend.dev"),
            "to": [os.environ.get("OFFICE_EMAIL", "info@remaxactivebroker.cz")],
            "subject": f"Nová poptávka od {msg.name}",
            "html": html})
    except Exception as e:
        logger.error(f"Email send failed: {e}")

@api_router.post("/contact")
async def create_contact(body: ContactCreate):
    msg = ContactMessage(**body.model_dump())
    await db.messages.insert_one(msg.model_dump())
    asyncio.create_task(asyncio.to_thread(send_notification_email, msg))
    return {"message": "Zpráva byla odeslána. Brzy se vám ozveme."}

@api_router.get("/messages")
async def list_messages(user: dict = Depends(get_current_user)):
    msgs = await db.messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return msgs

@api_router.put("/messages/{message_id}/read")
async def mark_read(message_id: str, user: dict = Depends(get_current_user)):
    await db.messages.update_one({"id": message_id}, {"$set": {"is_read": True}})
    return {"message": "OK"}

@api_router.delete("/messages/{message_id}")
async def delete_message(message_id: str, user: dict = Depends(get_current_user)):
    await db.messages.delete_one({"id": message_id})
    return {"message": "Smazáno"}

@api_router.get("/stats")
async def stats(user: dict = Depends(get_current_user)):
    return {
        "properties": await db.properties.count_documents({}),
        "agents": await db.agents.count_documents({}),
        "messages": await db.messages.count_documents({}),
        "unread_messages": await db.messages.count_documents({"is_read": False}),
    }

@api_router.get("/")
async def root():
    return {"message": "RE/MAX Active Broker API"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Seed ----------------
SEED_AGENTS = [
    {"name": "Petr Novák", "role": "Vedoucí kanceláře", "phone": "+420 777 123 456",
     "email": "petr.novak@remaxactivebroker.cz",
     "bio": "S více než 15 lety zkušeností na Tachovsku zná Petr místní trh jako nikdo jiný. Specializuje se na prodej rodinných domů a investičních nemovitostí.", "order": 1},
    {"name": "Jana Svobodová", "role": "Realitní makléřka", "phone": "+420 777 234 567",
     "email": "jana.svobodova@remaxactivebroker.cz",
     "bio": "Jana se zaměřuje na byty a novostavby. Klienti oceňují její osobní přístup a pečlivost při každém obchodu.", "order": 2},
    {"name": "Tomáš Dvořák", "role": "Realitní makléř", "phone": "+420 777 345 678",
     "email": "tomas.dvorak@remaxactivebroker.cz",
     "bio": "Specialista na pozemky a komerční nemovitosti. Tomáš vám pomůže najít ideální místo pro vaše podnikání.", "order": 3},
    {"name": "Lucie Marková", "role": "Realitní makléřka", "phone": "+420 777 456 789",
     "email": "lucie.markova@remaxactivebroker.cz",
     "bio": "Lucie má cit pro detail a vášeň pro design interiérů. Pomáhá klientům prezentovat nemovitosti v nejlepším světle.", "order": 4},
    {"name": "Martin Černý", "role": "Realitní makléř", "phone": "+420 777 567 890",
     "email": "martin.cerny@remaxactivebroker.cz",
     "bio": "Mladý a energický makléř s moderním přístupem k marketingu nemovitostí. Martin využívá nejnovější technologie pro rychlý prodej.", "order": 5},
]

SEED_TEAM_PHOTOS = [
    "https://images.unsplash.com/photo-1647580427155-0483906cb9de?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MDV8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjByZWFsJTIwZXN0YXRlJTIwYWdlbnQlMjBwb3J0cmFpdCUyMHNtaWxpbmd8ZW58MHx8fHwxNzgyNDMxNzY0fDA&ixlib=rb-4.1.0&q=85",
    "https://images.unsplash.com/photo-1772987438485-ac832640c8a5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MDV8MHwxfHNlYXJjaHw0fHxwcm9mZXNzaW9uYWwlMjByZWFsJTIwZXN0YXRlJTIwYWdlbnQlMjBwb3J0cmFpdCUyMHNtaWxpbmd8ZW58MHx8fHwxNzgyNDMxNzY0fDA&ixlib=rb-4.1.0&q=85",
    "https://images.unsplash.com/photo-1585240975858-7264fd020798?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MDV8MHwxfHNlYXJjaHwzfHxwcm9mZXNzaW9uYWwlMjByZWFsJTIwZXN0YXRlJTIwYWdlbnQlMjBwb3J0cmFpdCUyMHNtaWxpbmd8ZW58MHx8fHwxNzgyNDMxNzY0fDA&ixlib=rb-4.1.0&q=85",
    "https://images.pexels.com/photos/7641824/pexels-photo-7641824.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.unsplash.com/photo-1780733064206-4f200e41daa8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MDV8MHwxfHNlYXJjaHwyfHxwcm9mZXNzaW9uYWwlMjByZWFsJTIwZXN0YXRlJTIwYWdlbnQlMjBwb3J0cmFpdCUyMHNtaWxpbmd8ZW58MHx8fHwxNzgyNDMxNzY0fDA&ixlib=rb-4.1.0&q=85",
]

SEED_PROP_IMAGES = [
    "https://images.unsplash.com/photo-1628012209120-d9db7abf7eab?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTJ8MHwxfHNlYXJjaHw0fHxtb2Rlcm4lMjBob3VzZSUyMGV4dGVyaW9yfGVufDB8fHx8MTc4MjQzMTc2NHww&ixlib=rb-4.1.0&q=85",
    "https://images.unsplash.com/photo-1721815693498-cc28507c0ba2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTJ8MHwxfHNlYXJjaHwzfHxtb2Rlcm4lMjBob3VzZSUyMGV4dGVyaW9yfGVufDB8fHx8MTc4MjQzMTc2NHww&ixlib=rb-4.1.0&q=85",
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTJ8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3VzZSUyMGV4dGVyaW9yfGVufDB8fHx8MTc4MjQzMTc2NHww&ixlib=rb-4.1.0&q=85",
    "https://images.unsplash.com/photo-1631679706909-1844bbd07221?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MjJ8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBsaXZpbmclMjByb29tJTIwYnJpZ2h0fGVufDB8fHx8MTc4MjQzMTc2NHww&ixlib=rb-4.1.0&q=85",
    "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MjJ8MHwxfHNlYXJjaHwzfHxtb2Rlcm4lMjBsaXZpbmclMjByb29tJTIwYnJpZ2h0fGVufDB8fHx8MTc4MjQzMTc2NHww&ixlib=rb-4.1.0&q=85",
    "https://images.pexels.com/photos/7031581/pexels-photo-7031581.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
]

SEED_PROPERTIES = [
    {"title": "Moderní rodinný dům s zahradou", "deal_type": "prodej", "property_type": "dum",
     "price": 8900000, "location": "Tachov - Bílá Hora", "bedrooms": 4, "bathrooms": 2, "area": 180,
     "featured": True, "description": "Krásný moderní rodinný dům 4+1 s prostornou zahradou v klidné lokalitě. Novostavba s energeticky úsporným provozem, garáží a terasou."},
    {"title": "Prostorný byt 3+kk v centru", "deal_type": "prodej", "property_type": "byt",
     "price": 4200000, "location": "Tachov - centrum", "bedrooms": 3, "bathrooms": 1, "area": 78,
     "featured": True, "description": "Světlý a prostorný byt 3+kk po kompletní rekonstrukci v srdci Tachova. Výborná dostupnost občanské vybavenosti."},
    {"title": "Stavební pozemek 950 m²", "deal_type": "prodej", "property_type": "pozemek",
     "price": 1650000, "location": "Planá u Tachova", "bedrooms": 0, "bathrooms": 0, "area": 950,
     "featured": False, "description": "Rovinatý stavební pozemek se všemi inženýrskými sítěmi na hranici pozemku. Ideální pro stavbu rodinného domu."},
    {"title": "Útulný byt 2+1 k pronájmu", "deal_type": "pronajem", "property_type": "byt",
     "price": 14500, "location": "Tachov - sídliště", "bedrooms": 2, "bathrooms": 1, "area": 56,
     "featured": True, "description": "Zařízený byt 2+1 k okamžitému nastěhování. Po rekonstrukci, s balkonem a sklepní kójí. Cena včetně poplatků."},
    {"title": "Komerční prostor v centru", "deal_type": "pronajem", "property_type": "komercni",
     "price": 22000, "location": "Tachov - náměstí", "bedrooms": 0, "bathrooms": 1, "area": 120,
     "featured": False, "description": "Reprezentativní obchodní prostor na frekventovaném místě. Vhodný pro obchod, kanceláře nebo služby. Výloha do ulice."},
    {"title": "Rodinný dům k rekonstrukci", "deal_type": "prodej", "property_type": "dum",
     "price": 3300000, "location": "Stříbro", "bedrooms": 5, "bathrooms": 1, "area": 140,
     "featured": False, "description": "Starší rodinný dům s velkým potenciálem na prostorném pozemku. Vhodný k rekonstrukci dle vlastních představ."},
]

@app.on_event("startup")
async def startup():
    # Indexes
    await db.users.create_index("email", unique=True)
    await db.properties.create_index("id", unique=True)
    await db.agents.create_index("id", unique=True)
    # Admin seed
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@example.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({"email": admin_email, "password_hash": hash_password(admin_password),
                                   "name": "Admin", "role": "admin",
                                   "created_at": datetime.now(timezone.utc).isoformat()})
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
    # Seed agents
    if await db.agents.count_documents({}) == 0:
        agent_ids = []
        for i, a in enumerate(SEED_AGENTS):
            agent = AgentModel(**a, photo_url=SEED_TEAM_PHOTOS[i])
            await db.agents.insert_one(agent.model_dump())
            agent_ids.append(agent.id)
        # Seed properties
        for i, p in enumerate(SEED_PROPERTIES):
            prop = PropertyModel(**p, images=[SEED_PROP_IMAGES[i % len(SEED_PROP_IMAGES)]],
                                 agent_id=agent_ids[i % len(agent_ids)])
            await db.properties.insert_one(prop.model_dump())
    # Storage
    try:
        init_storage()
        logger.info("Storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
