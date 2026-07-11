import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq

load_dotenv()

GROQ_API_KEY = os.environ['GROQ_API_KEY']
if GROQ_API_KEY is None:
  raise ValueError("GROQ_API_KEY is not set")

llm = ChatGroq(
  model="openai/gpt-oss-120b",
  temperature=0,
  api_key=GROQ_API_KEY
)