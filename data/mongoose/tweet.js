import mongoose from 'mongoose';

const ObjectId = mongoose.ObjectId;

mongoose.connect(
    'mongodb+srv://dwitter:IB1RMUVgJQouSLCh@cluster0.db3jq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
);

const tweetSchema = mongoose.Schema(
    {
        text: String,
        userId: String,
        username: String,
        name: String,
        url: String,
    },
    {
        timestamps: true,
    }
);

// _id -> id
tweetSchema.virtual('id').get(function () {
    return this._id.toString();
});
tweetSchema.set('toJSON', { virtuals: true });
tweetSchema.set('toObject', { virtuals: true });

const Tweet = mongoose.model('Tweet', tweetSchema);

const kitty = new Tweet({
    text: 'New Message!',
    userId: '610f22fd1750f665658863d4',
    username: 'ellie2',
    name: 'Ellie2',
    url: 'https://widgetwhats.com/app/uploads/2019/11/free-profile-photo-whatsapp-1.png',
});

await kitty.save().then(() => {
    console.log('created!', kitty);
});

await Tweet.findById(kitty._id).then((result) => {
    console.log('findById', result);
});

await Tweet.findByIdAndUpdate(kitty._id, {
    $set: { text: 'Updated Message!' },
}).then((result) => {
    console.log('findByIdAndUpdate', result);
});

await Tweet.findOneAndUpdate(
    { _id: kitty._id },
    {
        $set: { text: 'Updated Message2!' },
    },
    {
        new: true,
    }
).then((result) => {
    console.log('findOneAndUpdate', result);
});

await Tweet.findOneAndDelete({ _id: kitty._id }).then((result) => {
    console.log('findOneAndDelete', result);
});

// Tweet.updateOne({ size: 'large' }, { name: 'T-90' }, function(err, res) {
//     // Updated at most one doc, `res.modifiedCount` contains the number
//     // of docs that MongoDB updated
//   });

mongoose.disconnect();
