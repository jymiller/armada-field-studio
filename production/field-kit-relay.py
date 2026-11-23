"""Serve this demo to the paired Mac and iPhone on their Tailscale IPs."""
import argparse
import json
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from time import monotonic

parser = argparse.ArgumentParser()
for arg in ('mac', 'phone', 'directory'):
    parser.add_argument('--' + arg, required=True)
args = parser.parse_args()
lock = threading.Lock()
state = dict(sequence=0, sound='stop', timestamp=0, listener=0)

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=args.directory, **kw)
    def permitted(self):
        return self.client_address[0] in (args.mac, args.phone)
    def reply(self, value):
        data = json.dumps(value).encode()
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)
    def do_GET(self):
        if not self.permitted():
            return self.send_error(403)
        if self.path == '/kit/relay':
            with lock:
                self.reply(dict(role='phone' if self.client_address[0]==args.phone else 'mac',
                                sequence=state['sequence'],sound=state['sound'],
                                fresh=monotonic()-state['timestamp']<2,ready=monotonic()-state['listener']<3))
        else:
            super().do_GET()
    def do_POST(self):
        origin='http://'+args.mac+':8173'
        if not self.permitted() or self.headers.get('Origin') != origin or self.path != '/kit/relay':
            return self.send_error(403)
        length=int(self.headers.get('Content-Length',0))
        if not 0<length<50:return self.send_error(400)
        sound=self.rfile.read(length).decode()
        with lock:
            if self.client_address[0]==args.phone and sound=='ready':state['listener']=monotonic()
            elif self.client_address[0]==args.mac and sound in ('clap','drum','shine','stop'):
                state.update(sequence=state['sequence']+1,sound=sound,timestamp=monotonic())
            else:return self.send_error(400)
            self.reply({'ok':True})
    def list_directory(self,path):
        self.send_error(403)
    def log_message(self,*args):
        pass

ThreadingHTTPServer((args.mac,8173),Handler).serve_forever()
