#!/usr/bin/env python3
"""Örtlicher Prüfserver ohne Zwischenspeicher.

Wie python3 -m http.server 8000, aber jede Antwort trägt Cache-Control
no-store. Ohne das hält Chrome unveränderte Dateien heuristisch fest und
zeigt beim Prüfen alte Stände, bei Modulskripten sogar gemischte
(Befund vom 25.08.2026: die Missionsseite erschien als Monate alter
Platzhalter). Start: python3 server.py
"""
import http.server


class OhneCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    http.server.test(HandlerClass=OhneCache, port=8000)
