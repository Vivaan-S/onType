path = require("path")
let sessions = {}
exp = require("express")
cookieParser = require("cookie-parser")
app = exp()
app.get("/fife/test", function(req,res){
})
app.use(cookieParser())
app.use(function(req,res,next){
  if(req.url.includes("reserved")){
    if(!req.cookies.editorSession){
    res.cookie("editorSession",String(Math.random()))
    }
  }
  next()
})
app.use(exp.urlencoded({extended:1}))
app.post("/fife/upload",function(req,res){
  res.send("200")
  let session = req.cookies.editorSession
  if(!session){
    return
  }
  sessions[session] = JSON.parse(req.body.files)
})
app.use("/fife",exp.static("reserved"))
app.get("*", function(req,res){
  if(req.url=="/"){
    req.url="/index.html"
  }
  let session = req.cookies.editorSession;
  if(!session||!sessions[session]){
    res.redirect("/fife/editor")
    return
  }
  let file = sessions[session][path.basename(req.url)]
  if(!file){
    res.send("Sorry, We could not find your file. Try creating it again.")
  }
  res.set("Content-Type", file.mime);
  res.send(Buffer.from(file.content,"base64"))
})
app.listen(3000)
