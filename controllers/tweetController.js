const Tweet = require("../models/Tweet");
const User = require("../models/User");

async function index(req, res) {
  // Obtener el usuario logueado
  const currentUser = await User.findById(req.auth.id);

  // Obtener los usuarios que sigue el usuario logueado
  const followingUsers = currentUser.following;

  // Obtener los tweets de los usuarios que sigue el usuario logueado y ordenarlos por fecha de creación descendente
  const tweets = await Tweet.find({ userId: { $in: followingUsers } })
    .sort({ createdAt: -1 })
    .limit(20);

  return res.json({ tweets });
}

async function show(req, res) {
  console.log(req.auth.id);
  const tweets = await Tweet.find({ userId: req.auth.id });
  return res.json(tweets);
}
async function tweet(req, res) {
  const newTweet = await Tweet.create({
    body: req.body.newTweet,
    userId: req.auth.id,
  });
  const user = await User.findById(req.user.id);
  user.tweets.push(newTweet);
  await user.save();
  await newTweet.save();

  return res.json("Se ha creado un Tweet");
}

async function like(req, res) {
  const tweet = await Tweet.findById(req.params.id);

  if (!tweet.likes.includes(req.auth.id)) {
    tweet.likes.push(req.auth.id);
  } else {
    tweet.likes.pull(req.auth.id);
  }

  await tweet.save();

  return res.json("Se ha actualizado likes");
}

async function destroy(req, res) {
  await Tweet.findOneAndDelete({ _id: req.params.id, userId: req.auth.id });

  return res.json("Se ha eliminado el Tweet");
}

module.exports = {
  index,
  show,
  like,
  tweet,
  destroy,
};
