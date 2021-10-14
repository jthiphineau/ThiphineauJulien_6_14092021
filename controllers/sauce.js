const Sauce = require("../models/Sauce");

//Afficher toutes les sauces
exports.getAllSauce = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

// Afficher une seule sauce
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

// Créer une sauce
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
  });
  sauce
    .save()
    .then(() => res.status(201).json({ message: "Sauce enregistrée" }))
    .catch((error) => res.status(400).json({ error }));
};

// Modifier une sauce
exports.modifySauce = (req, res, next) => {
  Sauce.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
    .then(() => res.status(200).json({ message: "Sauce modifiée" }))
    .catch((error) => res.status(400).json({ error }));
};

// Supprimer une sauce
exports.deleteSauce = (req, res, next) => {
  Sauce.deleteOne({ _id: req.params.id })
    .then(() => res.status(200).json({ message: "Sauce supprimée" }))
    .catch((error) => res.status(400).json({ error }));
};
// J'aime, je n'aime pas et annuler j'aime ou je n'aime pas
exports.likeDislikeSauce = (req, res, next) => {
  const userId = req.body.userId;
  const like = req.body.like;
  const sauceId = req.params.id;

  // Like
  if (like == 1) {
    Sauce.updateOne(
      //On récupère la sauce
      { _id: sauceId },
      {
        // on incrémente les likes de 1
        $inc: { like: +1 },
        // On met le user dans le tableau des users ayant liké
        $push: { usersLiked: userId },
      }
    )
      // Alors message
      .then(() =>
        res.status(201).json({ message: "Vous avez aimé cette sauce!" })
      )
      // Sinon on retourne une erreur 400
      .catch((error) => res.status(400).json({ error }));
    return;
  }

  // Dislike
  if (like === -1) {
    Sauce.updateOne(
      { _id: sauceId },
      {
        $inc: { dislike: +1 },
        $push: { usersDisliked: userId },
      }
    )
      .then(() =>
        res.status(201).json({ message: "Vous n'avez pas aimé cette sauce!" })
      )
      .catch((error) => res.status(400).json({ error }));
    return;
  }

  // Annulation Like ou Dislike
  if (like === 0) {
    // On retrouve la sauce
    Sauce.findOne({ _id: sauceId })
      .then((sauce) => {
        // Si le user a déjà liké la sauce
        if (sauce.usersLiked.includes(userId)) {
          sauce
            .updateOne(
              { _id: sauceId },
              {
                //On incrémente les likes de -1
                $inc: { likes: -1 },
                // On retire le user du tableau des users ayant liké
                $pull: { usersLiked: userId },
              }
            )
            //Alors message
            .then(() =>
              res.status(201).json({ message: "Votre avez retiré votre Like" })
            )
            // Sinon on retourne une erreur 400
            .catch((error) => res.status(400).json({ error }));
          return;
        }

        // Si le user a déjà disliké la sauce
        if (sauce.usersDisliked.includes(userId)) {
          sauce
            .updateOne(
              { _id: sauceId },
              {
                $inc: { dislikes: -1 },
                $pull: { usersDisliked: userId },
              }
            )
            .then(() =>
              res
                .status(201)
                .json({ message: "Votre avez retiré votre Dislike" })
            )
            .catch((error) => res.status(400).json({ error }));
          return;
        }
      })
      .catch((error) => res.status(400).json({ error }));
  }
};
