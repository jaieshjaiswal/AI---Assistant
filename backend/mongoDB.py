from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")

db = client["ai_assistant"]

chat_collection = db["chats"]

user_collection = db["users"]