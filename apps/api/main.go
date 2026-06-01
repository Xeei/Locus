package main

import (
	"locus/api/ws"
	"net/http"
)



func main() {

	http.HandleFunc("/ws", ws.Echo)
	http.ListenAndServe(":8000", nil)
}