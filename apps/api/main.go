package main

import (
	"locus/api/ws"

	"github.com/gin-gonic/gin"
)



func main() {


	r := gin.Default()

	r.GET("/ws", func(ctx *gin.Context) {
		ws.Echo(ctx.Writer, ctx.Request)
	})


	r.Run(":8000")
}