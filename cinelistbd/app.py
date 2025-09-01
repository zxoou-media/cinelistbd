import http.server
import socketserver

PORT = 8000

# SimpleHTTPRequestHandler ব্যবহার করে একটি সাধারণ সার্ভার তৈরি করা
Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print("সার্ভার চালু হয়েছে http://localhost:8000")
    httpd.serve_forever()
