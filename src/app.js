const express=require("express");
const path=require("path");
const app=express();
const hbs=require("hbs");
const bcrypt=require("bcryptjs");

require("./db/conn");
const Register=require("./models/registers");
const Shop=require("./models/shops");

const port=process.env.PORT || 3000

const static_path=path.join(__dirname, "../public");
const template_path=path.join(__dirname, "../templates/views");
const partials_path=path.join(__dirname, "../templates/partials");

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);

app.get('/', (req, res)=>{
    res.render("index");
});

app.get('/login', (req, res)=>{
    res.render("login");
})
app.get('/register', (req, res)=>{
    res.render("register");
})

app.get('/add-user', (req, res)=>{
    res.render("add_user");
})

//Below block of code is used to add_user in admin's( crud part)
app.post('/add', async (req, res)=>{
    try {
        if(!req.body){
        res.status(400).send({ message : "Content can not be emtpy!"});
        return;
    }
        const registerShop=new Shop({
            name: req.body.name,
            email: req.body.email,
            gender: req.body.gender,
            status : req.body.status
        })
        const registeredd=await registerShop.save();
        res.status(201).render("add_user");
    } catch (error) {
        res.status(400).send("erorr occur while adding new User:- "+error);
    }
})

//Below i created a function so that index1 is always rendered from below code
const renderIndex1 = async (res) => {
    try {
        let ShopResult = await Shop.find({}).exec();
        if (ShopResult) {
            res.render('index1', { data: ShopResult });
            console.log("bol");
        }
    } catch (err) {
        next(err);
    }
};

app.get('/index1', async(req, res, next)=>{
    await renderIndex1(res);
})

//Below block of code is used to see particular data to update-user page
app.get('/update-user/:id', async(req, res, next)=>{
    var id=req.params.id;
    let ShopData=await Shop.findOne({_id:id}).exec();
    if(ShopData){
        res.render('update_user', {data:ShopData});
    }else{
        res.send("invalid request");
    }
})

//Below block of code is used to update the existing data of shop's user(Crud part)
app.put('/upd/:id', async (req, res)=>{
    if(!req.body){
        return res
            .status(400)
            .send({ message : "Data to update can not be empty"})
    }

    const id = req.params.id
    try {
        const data = await Shop.findByIdAndUpdate(id, {$set:{
            name:req.body.name,
            email: req.body.email,
            gender: req.body.gender,
            status : req.body.status
        }}, { new: true, useFindAndModify: false });

        if (!data) {
            return res.status(404).send({ message: `Cannot update user with ID: ${id}. User not found!` });
        }

        res.send(data);
    } catch (err) {
        res.status(500).send({ message: "Error updating user information" });
    }
})

app.get('/del/:id', async(req, res, next)=>{
    const id=req.params.id;
    try{
        let result=await Shop.deleteOne({_id:id});
    if(result){
        await renderIndex1(res);
    }else{
        res.send("invalid request");
    }
    } catch(err){
        console.log(err);
    }
})

// Below block of code is used to create a new user in our database(Register)
app.post('/register', async (req, res)=>{
    try {
        // console.log(req.body.name);
        // res.send(req.body.name);
        const registerEmployee=new Register({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        })
        
        const token= await registerEmployee.generateAuthToken();
        console.log("the token part:- " +token);
        const registered=await registerEmployee.save();
        res.status(201).render("front");
    } catch (error) {
        res.status(400).send(error);
    }
})

// login Validation(admin)
app.post('/login', async (req, res)=>{
    try {
        const email=req.body.email;
        const password=req.body.password;

        const username = await Register.findOne({email:email});
        const isMatch=await bcrypt.compare(password, username.password);

        //Below is Middleware
        const token= await username.generateAuthToken();
        console.log("the tokenl part:- " +token);

        if(isMatch){
            await renderIndex1(res);
        }
        else{
            res.send("Invalid login Details");
        }

    } catch (error) {
        res.status(400).send("Invalid login Details");
    }
})

// login Validation(User)
app.post('/login1', async (req, res)=>{
    try {
        const email=req.body.email;
        const password=req.body.password;

        const username = await Register.findOne({email:email});
        const isMatch=await bcrypt.compare(password, username.password);

        //Below is Middleware
        const token= await username.generateAuthToken();
        console.log("the tokenl part:- " +token);

        if(isMatch){
            res.status(201).render("front");
        }
        else{
            res.send("Invalid login Details");
        }

    } catch (error) {
        res.status(400).send("Invalid login Details");
    }
})


app.listen(port, ()=>{
    console.log(`server is running at port no. ${port}`);
})