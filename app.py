from flask import Flask, render_template
import requests

app = Flask(__name__)

ACCESS_TOKEN = "YOUR_ACCESS_TOKEN"
USER_ID = "YOUR_USER_ID"

@app.route("/")
def profile():
    profile_url = f"https://graph.instagram.com/{USER_ID}?fields=id,username,account_type,media_count,profile_picture_url&access_token={ACCESS_TOKEN}"
    profile_data = requests.get(profile_url).json()

    media_url = f"https://graph.instagram.com/{USER_ID}/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url&access_token={ACCESS_TOKEN}"
    media_data = requests.get(media_url).json()

    return render_template("profile.html", profile=profile_data, media=media_data.get("data", []))

if __name__ == "__main__":
    app.run(debug=True)
