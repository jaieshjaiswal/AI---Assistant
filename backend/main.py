from mongoDB import chat_collection, user_collection 
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import requests
import bcrypt
load_dotenv()

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = os.getenv("OPENROUTER_API_KEY")


class ChatRequest(BaseModel):
    messages: list

class UserRequest(BaseModel):
    username: str
    password: str
    
@app.post("/signup")
def signup(user: UserRequest):

    existing_user = user_collection.find_one({
        "username": user.username
    })

    if existing_user:
        return {
            "message": "Username already exists"
        }

    hashed_password = bcrypt.hashpw(
        user.password.encode("utf-8"),
        bcrypt.gensalt()
    )

    user_collection.insert_one({
        "username": user.username,
        "password": hashed_password.decode("utf-8")
    })

    return {
        "message": "User created successfully"
    }
@app.post("/login")
def login(user: UserRequest):

    existing_user = user_collection.find_one({
        "username": user.username
    })

    if not existing_user:
        return {
            "message": "User not found"
        }

    password_correct = bcrypt.checkpw(
        user.password.encode("utf-8"),
        existing_user["password"].encode("utf-8")
    )

    if not password_correct:
        return {
            "message": "Wrong password"
        }

    return {
        "message": "Login successful"
    }
@app.post("/chat")
def chat(req: ChatRequest):

    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json"
        },
        json={
           "model": "openai/gpt-4o-mini",
            "messages": req.messages
        },
        timeout=15
    )

    try:
        data = response.json()

    except:
        return {
            "reply": "AI service temporarily unavailable"
        }

    print("AI response received")

    if "choices" in data:

        reply = data["choices"][0]["message"]["content"]

        chat_collection.insert_one({
            "messages": req.messages,
            "reply": reply
        })

        return {
            "reply": reply
        }

    else:

        error_message = data.get(
            "error",
            {}
        ).get(
            "message",
            "API Error"
        )

        print(error_message)

        return {
            "reply": error_message
        }


@app.get("/history")
def get_history():

    chats = list(
        chat_collection.find(
            {},
            {"_id": 0}
        )
    )

    return {
        "history": chats
    }
@app.get("/")
def home():

    return {
        "message": "Backend running"
    }