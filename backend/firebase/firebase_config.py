import firebase_admin
from firebase_admin import credentials

cred = credentials.Certificate("firebase/assetflow-1fcad-firebase-adminsdk-fbsvc-40fa64bb36.json")

firebase_admin.initialize_app(cred)