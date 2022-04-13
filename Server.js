const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');


const app = express();
app.use(cors());
app.use(express.json());//to convert data into json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

//connection string
mongoose.connect("mongodb://localhost:27017/Test", {
  useUnifiedTopology: true,
  useNewUrlParser: true
}).then(() => console.log('connection successfull')).catch((error) => console.log(error));

//creating db schema object
//users
const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 15
  },
  lastname: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 15
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024
  },
  cpassword: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024
  }
})
//clients
const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 15
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true
  },
  phone: {
    type: Number,
    required: true,
    minlength: 5,
    maxlength: 20
  },
  adress: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024
  },
  state: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024
  },
  city: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024
  },
  users: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
})
//bookings
const bookingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 15
  },
  model: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 25,
  },
  phone: {
    type: Number,
    required: true,
    minlength: 2,
    maxlength: 1000,
  },
  perdayrent: {
    type: Number,
    required: true,
    minlength: 4,
    maxlength: 1000
  },
  fromdate: {
    type: Date,
    required: true,
    minlength: 5,
    maxlength: 1024
  },
  todate: {
    type: Date,
    required: true,
    minlength: 5,
    maxlength: 1024
  },
  clientsId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' }
})

//generating JWT
/*
userSchema.methods.generateAuthToken = async function () {
  try {
    let token = jwt.sign({ _id: this._id }, 'MYNAMEISMUHAMMADZAINALI');
    this.tokens = this.tokens.concat({ token: token });
    await this.save();
    return token;
  } catch (error) {
    console.log(error);
  }
}
*/

//creating collections using model class it start with PascalCase
const User = new mongoose.model('User', userSchema);
const Client = new mongoose.model('Client', clientSchema);
const Booking = new mongoose.model('Booking', bookingSchema);

//Middleware functions are functions that have access to the request object ( req ), the response object ( res ), and the next function in the application's request-response cycle. The next function is a function in the Express router which, when invoked, executes the middleware succeeding the current middleware
//basically y chek kerta ha k ager user login ha to usko homepage dikha do otherwise login page py redirect kerdo

//middlewares;
//1:test
const middleware = (req, res, next) => {
  console.log('middleware');
  next();
}
//2:ager user ka token mila to datad hsow ho jaye ga homepage pa
/*
const authenticate = async (req, res, next) => {
  try {
    console.log(req.jwt);
    const token = req.cookies.jwt;
    console.log('below');
    const varifyToken = jwt.verify(token, 'MYNAMEISMUHAMMADZAINALI');
    console.log(varifyToken);
    const rootUser = await User.findOne({ _id: varifyToken._id, 'tokens.token': token });
    if (!rootUser) {
      throw new Error('user not fount');
    }
    req.token = token;
    req.rootUser = rootUser;
    req.userID = rootUser._id;
    next();
  } catch (error) {
    res.status(401).send('unauthorized: no token prvided')
    console.log(error)
  }
}
*/


// router................
//using middleware
app.get('/aboutme', middleware, (req, res) => {
  res.cookie('jwtoken', 'zain')
  res.send('about me page');
})
//clients
//add clients
app.post('/clients', async (req, res) => {
  const { name, email, phone, adress, state, city, users } = req.body;
  if (!name || !email || !phone || !adress || !state || !city) {
    return res.status(422).json({ error: 'fill the fields properly' });//show error
  }
  try {
    const clientExist = await Client.findOne({ email: email });//left side wala database ka of right side wala server ka name attribute ha
    if (clientExist) {
      return res.status(422).json({ error: 'Email Already Exist' });
    } else {
      const client = new Client({ name, email, phone, adress, state, city, users });//creating a document
      await client.save();
      res.status(201).json({ message: 'client added  succusefully' });
    }
  } catch (error) {
    console.log(error);
  }
})

//get specific client
app.get('/clients/:id', async (req, res) => {
  //const users = req.body;
  try {
    console.log(req.params.id)
    const PAGE_SIZE = 13;
    const page = parseInt(req.query.page || "0");
    const total = await Client.countDocuments({});
    const clients = await Client.find({ users: req.params.id })
      .limit(PAGE_SIZE)
      .skip(PAGE_SIZE * page);
    res.status(200).json({
      totalPages: Math.ceil(total / PAGE_SIZE),
      clients,
    });
  } catch (error) {
    console.log(error);
  }
})
//get all client
app.get('/allclients', async (req, res) => {
  try {
    const PAGE_SIZE = 10;
    const page = parseInt(req.query.page || "0");
    const total = await Client.countDocuments({});
    const clients = await Client.find({})
      .limit(PAGE_SIZE)
      .skip(PAGE_SIZE * page);
    res.status(200).json({
      totalPages: Math.ceil(total / PAGE_SIZE),
      clients,
    });
  } catch (error) {
    console.log(error);
  }
})

//delete clientsData
app.delete('/clients/delete/:id', async (req, res) => {
  try {
    const delclient = await Client.deleteOne({ _id: req.params.id });
    if (delclient) {
      return res.status(201).json({ message: 'client deleted successfully' })
    } else {
      return res.status(422).json({ error: 'invalid clientID' });
    }
  } catch (error) {
    console.log(error)
  }
})

//update clientsData
app.put("/clients/update/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const updateData = await Client.findByIdAndUpdate(_id, req.body, { new: true })
    res.send(updateData);
  } catch (e) {
    res.status(500).send(e);
  }
});

//get user id for client
app.get('/clients-detail', async (req, res) => {
  const token = req.headers['x-access-token']
  try {
    const decoded = jwt.verify(token, 'secret123')
    const email = decoded.email
    const user = await User.findOne({ email: email })
    return res.json({ status: 'ok', quote: user._id })
  } catch (error) {
    console.log(error)
    res.json({ status: 'error', error: 'invalid token' })
  }
})

//bookings
//add bookings
app.post('/bookings/', async (req, res) => {
  const { name, model, phone, perdayrent, fromdate, todate, clientsId } = req.body;
  if (!name || !model || !phone || !perdayrent || !fromdate || !todate || !clientsId) {
    return res.status(422).json({ error: 'fill the fields properly' });//show error
  }
  try {
    const bookingtExist = await Booking.findOne({ phone: phone });//left side wala database ka of right side wala server ka name attribute ha
    if (bookingtExist) {
      return res.status(422).json({ error: 'Phone Already Exist' });
    } else {
      const book = new Booking({ name, model, phone, perdayrent, fromdate, todate, clientsId });//creating a document
      await book.save();
      //console.log(book);
      res.status(201).json({ message: 'booking succusefully' });
    }
  } catch (error) {
    console.log(error);
  }
})
//get secific bookings
app.get('/bookings/:id', async (req, res) => {
  try {
    console.log(req.params.id)
    const PAGE_SIZE = 11;
    const page = parseInt(req.query.page || "0");
    const total = await Booking.countDocuments({});
    const bookings = await Booking.find({ clientsId: req.params.id }).populate('clientsId')
      .limit(PAGE_SIZE)
      .skip(PAGE_SIZE * page);
    res.status(200).json({
      totalPages: Math.ceil(total / PAGE_SIZE),
      bookings,
    });
  } catch (error) {
    console.log(error);
  }
})
//get all bookings
app.get('/allbookings', async (req, res) => {
  try {
    const PAGE_SIZE = 10;
    const page = parseInt(req.query.page || "0");
    const total = await Booking.countDocuments({});
    const bookings = await Booking.find({}).populate('clientsId')
      .limit(PAGE_SIZE)
      .skip(PAGE_SIZE * page);
    res.status(200).json({
      totalPages: Math.ceil(total / PAGE_SIZE),
      bookings,
    });
  } catch (error) {
    console.log(error);
  }
})
//delete bookingData
app.delete('/bookings/delete/:id', async (req, res) => {
  try {
    const delbooking = await Booking.deleteOne({ _id: req.params.id });
    if (delbooking) {
      return res.status(201).json({ message: 'Booking deleted successfully' })
    } else {
      return res.status(422).json({ error: 'invalid BookingID' });
    }
  } catch (error) {
    console.log(error)
  }
})

//update updateData
app.put("/bookings/update/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const updateData = await Booking.findByIdAndUpdate(_id, req.body, { new: true })
    res.send(updateData);
  } catch (e) {
    res.status(500).send(e);
  }
});

//users
//user registration
app.post('/register', async (req, res) => {
  const { firstname, lastname, email, password, cpassword } = req.body;
  if (!firstname || !lastname || !email || !password || !cpassword) {
    return res.status(422).json({ error: 'fill the fields properly' });//show error
  }
  try {
    const userExist = await User.findOne({ email: email });//left side wala database ka of right side wala server ka name attribute ha
    if (userExist) {
      return res.status(422).json({ error: 'Email Already Exist' });
    } else {
      const user = new User({ firstname, lastname, email, password, cpassword });//creating a document
      await user.save();
      res.status(201).json({ message: 'User Registered Succusefully' });
    }
  } catch (error) {
    console.log(error);
  }
})

//delete userData
app.delete('/delete/:id', async (req, res) => {
  try {
    const deluser = await User.deleteOne({ _id: req.params.id });
    if (deluser) {
      return res.status(201).json({ message: 'user deleted successfully' })
    } else {
      return res.status(422).json({ error: 'invalid userID' });
    }
  } catch (error) {
    console.log(error)
  }
})

//update userData
app.put("/update/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const updateData = await User.findByIdAndUpdate(_id, req.body, { new: true })
    res.send(updateData);
  } catch (e) {
    res.status(500).send(e);
  }
});

//user login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'fill the fields' });//show error
    }
    const user = await User.findOne({ email: email, password: password });//left side wala database ka of right side wala server ka name attribute ha

    if (user) {
      const isMatch = await password === user.password;
      if (isMatch) {
        const token = jwt.sign(
          {
            name: user.name,
            email: user.email,
          },
          'secret123'
        )
        return res.json({
          message: 'user logged in successfuly', user: token
        });
      } else {
        return res.status(400).json({ error: 'invalid credentials' });
      }
    } else {
      return res.status(400).json({ error: 'invalid credentials' });
    }
  } catch (error) {
    console.log(error);
  }
})

//user logout
app.get("/logout", (req, res) => {

})

//get users from database
app.get('/users', async (req, res) => {
  try {
    const PAGE_SIZE = 10;
    const page = parseInt(req.query.page || "0");
    const total = await User.countDocuments({});
    const users = await User.find({})
      .limit(PAGE_SIZE)
      .skip(PAGE_SIZE * page);
    res.status(200).json({
      totalPages: Math.ceil(total / PAGE_SIZE),
      users,
    });
  } catch (error) {
    console.log(error);
  }
})

//test aggregation
app.get('/clients-bookings/:id', function (req, res) {
  const clientsId = req.params.id;
  console.log(clientsId)
  let posts = Booking.find({ clientsId: clientsId }, function (err, posts) {
    if (err) {
      console.log(err);
    }
    else {
      res.json(posts);
    }
  }).populate('clientsId');
});
//register
/*using Promises
app.post('/register',(req,res)=>{
  const {name,age} = req.body;

  if(!name || !age){
    return res.status(422).json({error: 'fill the fields properly'});//show error
  }
//left side wala database ka of right side wala server ka name attribute ha
    User.findOne({name:name})
    .then((userExist) =>{
      if(userExist){
        return res.status(422).json({error: 'Name already exists'});
      }
      const user = new User({name,age});//creating a document
      user.save().then(()=>{
        res.status(201).json({message:'user created succusefully'});
      }).catch((error) => res.status(500).json({message:'registeration failed'}));
    }).catch(error=>{console.log(error)});
  
  //console.log(name);
  //console.log(age);
 // res.json({message : req.body});
})
*/

//using async await
//user registr test
/*
app.post('/register', async (req, res) => {
  const { name, age } = req.body;

  if (!name || !age) {
    return res.status(422).json({ error: 'fill the fields properly' });//show error
  }

  try {
    const userExist = await User.findOne({ name: name })//left side wala database ka of right side wala server ka name attribute ha
    if (userExist) {
      return res.status(422).json({ error: 'Name already exists' });
    }
    const user = new User({ name, age });//creating a document

    const userRegister = await user.save();

    if (userRegister) {
      res.status(201).json({ message: 'user registered succusefully' });
    } else {
      res.status(500).json({ message: 'registeration failed' });
    }

  } catch (error) {
    console.log(error);
  }
  //console.log(name);
  //console.log(age);
  // res.json({message : req.body});
})
*/

// Listening to the port
app.listen(5000, () => {
  console.log('server is running at port 5000');
})