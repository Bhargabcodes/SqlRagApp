import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq

load_dotenv()

groq_api_key = os.getenv("GROQ_API_KEY")

print("Key Found:", bool(groq_api_key))

llm = ChatGroq(
    groq_api_key=groq_api_key,
    model_name="openai/gpt-oss-120b",
    temperature=0
)

response = llm.invoke("Say hello in one sentence.")

print(response.content)