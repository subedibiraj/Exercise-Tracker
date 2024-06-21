const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose')
const {Schema} = mongoose

mongoose.connect(process.env.DB_URL)

const UserSchema = new Schema({
  username: String
})

const User = mongoose.model("User", UserSchema)

const ExerciseSchema = new Schema({
  username: {type: String, required: true},
  description: String,
  duration: Number,
  date: Date
})

const Exercise = mongoose.model("Exercise",ExerciseSchema);

app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({extended: true}))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


app.post('/api/users', async (req, res) => {
  console.log(req.body);
  const userObj = new User({
    username: req.body.username
  });
  try {
    const user = await userObj.save();
    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error saving user");
  }
});



app.post('/api/users/:id/exercises', async (req, res) => {
  const id = req.params.id;
  const { description, duration, date } = req.body;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.send("Could not find user");
    } else {
      const exerciseObj = new Exercise({
        user_id: user._id,
        description,
        duration,
        date: date ? new Date(date) : new Date()
      });
      const exercise = await exerciseObj.save();
      return res.json({
        _id: user._id,
        username: user.username,
        description: exercise.description,
        duration: exercise.duration,
        date: new Date(exercise.date).toDateString()
      });
    }
  } catch (err) {
    console.log(err);
    return res.send("There was an error saving exercise!");
  }
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
