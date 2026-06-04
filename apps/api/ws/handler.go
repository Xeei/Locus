package ws

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {return true},
}

var hub = NewHub()

func Echo(w http.ResponseWriter, r *http.Request) {
	c, err := upgrader.Upgrade(w, r, nil) // c: connecttion
	if err != nil {
		log.Print("upgrade:", err)
		return
	}

	defer func() {
		hub.Remove(c)
	 	c.Close() // aviod leak (garantee clean up)
	}()

	hub.Add(c)

	for {
		mt, message, err := c.ReadMessage()
		if err != nil {
			log.Println("read:", err)
			break
		}

		log.Printf("recv: %s", message)
		// err = c.WriteMessage(mt, message)
		hub.Broadcast(c, message)
		_ = mt

	}
}