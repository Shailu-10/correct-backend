//const { addFriend, mutualFriends } = require("../controllers/user");
const mongoose = require("mongoose");
const User = require("../models/user");
module.exports = {
  /*
    hello(){
        return 'hello World';
    }
        */
  /*
  hello() {
    return {
      text: "hello",
      views: 1234,
    };
  },
  */
  addUser: async function ({ userInput }, req) {
    try {
      const userName = userInput.name;
      const temp = userInput.friends;
      const userFriends = temp.split(/\s*,\s*/);
      const user = new User({
        name: userName,
      });
      const result = await user.save();
      const objCreated = await User.findById(result._id);
      //result and objCreated are same
      for (const friend of userFriends) {
        try {
          console.log("Trying to add friend with id: ", friend.trim());
          const friendId = friend.trim();
          //find the friend by Id
          if (!mongoose.Types.ObjectId.isValid(friend)) {
            console.log("invalid objectId type mongoose");
            const error = new Error("Invalid user ID to add.");
            error.statusCode = 400;
            throw error;
          }
          console.log("Before findbyId");
          const exist = await User.findById(friendId);
          console.log("After  Find by Id");
          if (exist) {
            console.log("this id exists: ", exist._id);
            exist.friends.push(objCreated._id);
            objCreated.friends.push(exist._id);
            const notneeded = await exist.save();
          } else {
            console.log("Friend with id ", friend, " doesn't exist");
          }
        } catch (err) {
          console.log("Error processing friend with id ", friend, err);
        }
      }
      const updatedUser = await objCreated.save();
      return updatedUser; //same schema h inka
    } catch (err) {
      console.log("error in creating addUser");
      console.log(err);
    }
  },
  addFriend: async function ({ curr_user_id, friend_user_id }, req) {
    try {
      // Extract user IDs from the request body
      //const currUserId = req.body.curr_user_id; // Current user ID (the one sending the request)
      //const userIdToAdd = req.body.add_user_id; // The user ID to be added as a friend
      const currUserId = curr_user_id;
      const userIdToAdd = friend_user_id;
      if (currUserId == userIdToAdd) {
        console.log("both id's are same");
        throw error;
      }
      // Check if userIdToAdd is valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(userIdToAdd)) {
        const error = new Error("Invalid user ID to add.");
        error.statusCode = 400;
        throw error;
      }

      // Find the user to add (the friend)
      const userToAdd = await User.findById(userIdToAdd);
      if (!userToAdd) {
        const error = new Error("Could not find user with this ID.");
        error.statusCode = 404;
        throw error;
      }

      // Find the current user
      const currUser = await User.findById(currUserId);
      if (!currUser) {
        const error = new Error("Current user not found.");
        error.statusCode = 404;
        throw error;
      }
      //now check, if userToAdd already exist in currUser Friend so throw error
      for (const friend of currUser.friends) {
        if (friend == userToAdd._id) {
          const error = new Error("User already present as friend");
          console.log("Already present user");
          error.statusCode = 404;
          throw error;
        }
      }

      // Add each other as friends (bi-directional relationship)
      currUser.friends.push(userToAdd._id);
      userToAdd.friends.push(currUser._id);

      // Save both the current user's and the friend's updated friend lists
      const updatedUser = await currUser.save();
      const updatingUserToAdd = await userToAdd.save();

      // Return a successful response
      /*
      res.status(200).json({
        message: "Friend added successfully.",
        userId: currUser._id,
        friends: currUser.friends,
      });
      */
      //we are returnning object that is same as define in our
      //Schema in schema.js file
      return {
        _id: updatedUser._id,
        name: updatedUser.name,
        friends: updatedUser.friends,
      };
    } catch (err) {
      // Error handling
      console.log(err);
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err); // Passing the error to the global error handler
    }
  },
  showFriends: async function ({ curr_user_id }, req) {
    try {
      const ans = [];
      const userId = curr_user_id;
      //const userId = req.body.curr_user_id;
      //const objectId = mongoose.Types.ObjectId(userId);
      const obj = await User.findById(userId);
      if (!obj) {
        const error = new Error("Could not find user with this ID.");
        error.statusCode = 404;
        throw error;
      }
      for (const friend of obj.friends) {
        const friendObj = await User.findById(friend);
        if (friendObj) {
          const temp = {
            _id: friendObj._id,
            name: friendObj.name,
            friends: friendObj.friends,
          };
          ans.push(temp);
        }
      }
      //simple write return, so json or so..
      return ans;
      //res.status(200).json({ ans });
      //means, object we found..
      //now, loop through it
    } catch (err) {
      // Error handling
      console.log(err);
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err); // Passing the error to the global error handler
    }
  },
  mutualFriends: async function ({ curr_user_id, friend_user_id }, req) {
    //here we get current user Id and id of the user we want to find mutual friends of
    try {
      //const currUserId = req.body.curr_user_id;
      //const userIdToCheckWith = req.body.userIdToCheckWith;
      const currUserId = curr_user_id;
      //const userIdToCheckWith = userIdToCheckWith;yeh upar direct we got
      const userIdToCheckWithFriends = new Set();
      //const userIdToCheckWithFriends=[];
      const mutualFriends = [];
      const userIdToCheckWith = friend_user_id;
      const obj = await User.findById(userIdToCheckWith);
      if (!obj) {
        const error = new Error("Current user not found.");
        error.statusCode = 404;
        throw error;
      }
      const currUser = await User.findById(currUserId);
      if (!currUser) {
        const error = new Error("Current user not found.");
        error.statusCode = 404;
        throw error;
      }
      /*
    if (currUserId == userIdToCheckWithFriends || currUser._id == obj._id) {
      const error = new Error("Both user Id's are same");
      error.statusCode = 404;
      throw error;
    }
      */
      for (const friend of obj.friends) {
        userIdToCheckWithFriends.add(friend);
      }
      for (const friend of currUser.friends) {
        if (userIdToCheckWithFriends.has(friend)) {
          const fetchNameOfUser = await User.findById(friend);
          const temp = {
            _id: fetchNameOfUser._id,
            name: fetchNameOfUser.name,
            friends: fetchNameOfUser.friends,
          };
          mutualFriends.push(temp);
        }
      }
      /*
      res.status(200).json({
        friends: mutualFriends,
      });
      */
      return mutualFriends;
      //array of objects with object same as we defined in our schema so no problem
    } catch (err) {
      // Error handling
      console.log(err);
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err); // Passing the error to the global error handler
    }
  },
  showAllDocument: async function (args, req) {
    // '/' route starting m, this function call
    //addFriend agar call hoga toh, re-render kra linge..
    try {
      const obj = await User.find();
      //obj will have array of all documents in collection..
      //means, collection bole toh table..document means
      //one document means one user entry
      if (!obj) {
        //obj not means, null or not defined, means
        //means, not user added till now, so we have to return something?
        //front end ko how we return error??
        /*
        return res.status(400).json({
          documents: [],
        });
        */
        return []; //empty array if nothing is found there.
        //empty array send if no documents
      }
      return obj;
      /*
      return res.status(200).json({
        documents: obj,
      });
      */
    } catch (err) {
      console.log("document not find");
      console.log(err);
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  },
  userDetail: async function ({ curr_user_id }, req) {
    try {
      console.log("function executing");
      if (!mongoose.Types.ObjectId.isValid(curr_user_id)) {
        console.log("invalid user id");
        const error = new Error("Invalid user ID to add.");
        error.statusCode = 400;
        throw error;
      }
      console.log("valid user id");
      const obj = await User.findById(curr_user_id);
      if (!obj) {
        console.log("obj details can't be fetched");
        const err = new Error("obj details cant be fetched");
        throw err;
      }
      console.log(obj._id);
      console.log(obj.name);
      console.log(obj.friends);
      return obj;
    } catch (err) {
      console.log("document not find");
      console.log(err);
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  },
  deleteUser: async function ({ curr_user_id }, req) {
    try {
      const currUserId = curr_user_id.trim();
      //currUserId nhi, its global delete User so, its
      //UserId koi bhi jo pass hui hume
      console.log("first line currUserId trim", currUserId);
      if (!mongoose.Types.ObjectId.isValid(currUserId)) {
        console.log("invalid user id isvalid returned false");
        const error = new Error("Invalid user ID to delete.");
        error.statusCode = 400;
        throw error;
      }
      console.log("before findById call");
      //also delete userIf from all friend list...
      const userFound = await User.findById(currUserId);
      console.log("yha tak user findById work for userId:", currUserId);

      if (!userFound) {
        //mwans, returned null for userFound if not exist and this willl run
        console.log("invalid user id ", currUserId);
        //in this case, not returning string to request so no problem??
        const error = new Error("Invalid user ID to delete.");
        error.statusCode = 400;
        throw error;
      }
      console.log(
        "after find by id yha tak user findById work for userId:",
        currUserId
      );
      //we came here, means user exist..
      for (const friend of userFound.friends) {
        console.log("for loop not working:", friend);
        const temp = await User.findById(friend);
        console.log("temp not defined");
        //friend ki id find and removing the user that we are deleting
        if (!temp) {
          console.log("friend id not foun but not possible for: ", friend);
          const error = new Error("friend id wala user not exist");
          error.statusCode = 400;
          throw error;
        }
        //userFound._id is not string
        console.log("userid _id is not string:", userFound._id);
        console.log("converting it to string: ", userFound._id.toString());
        const index = temp.friends.indexOf(userFound._id.toString());
        if (index > -1) {
          temp.friends.splice(index, 1);
        }
        const notneeded = await temp.save();
      }
      const succ = await User.findByIdAndDelete(userFound._id);

      if (!succ) {
        console.log("no user delete maybe id not found ", currUserId);
        return "false";
      }
      console.log("deleted user succesfully", userFound._id);
      return "true";
      //67528c29e8fef8f0a3ae2642
      //as this function return string so return true or false to know it is deleted
    } catch (err) {
      console.log("user not found");
      console.log(err);
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  },
  deleteFriend: async function ({ curr_user_id, friend_user_id }, req) {
    try {
      let userId = curr_user_id.trim();
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        const error = new Error("Invalid user ID to add.");
        error.statusCode = 400;
        throw error;
      }
      let friendId = friend_user_id.trim();
      if (!mongoose.Types.ObjectId.isValid(friendId)) {
        const error = new Error("Invalid user ID to add.");
        error.statusCode = 400;
        throw error;
      }
      const currUser = await User.findById(userId);
      if (!currUser) {
        const error = new Error("Could not find user with this ID.");
        console.log("Could not find user with this ID");
        error.statusCode = 404;
        throw error;
      }
      const friend = await User.findById(friendId);
      if (!friend) {
        const error = new Error("friend Id not found.");
        console.log("friend Id not found.");
        error.statusCode = 404;
        throw error;
      }
      const index = currUser.friends.indexOf(friend._id);
      if (index > -1) {
        // only splice array when item is found
        currUser.friends.splice(index, 1); // 2nd parameter means remove one item only
      } else {
        console.log("friend id is not friend of user");
        const error = new Error("Friend id is not in friend of user");
        error.statusCode = 404;
        throw error;
      }
      const index2 = friend.friends.indexOf(currUser._id);
      if (index2 > -1) {
        friend.friends.splice(index2, 1);
      } else {
        console.log("friend id is not friend of user second if one removed");
        const error = new Error("Friend id is not in friend of user");
        error.statusCode = 404;
        throw error;
      }
      const notneeded1 = await currUser.save();
      const notneeded2 = await friend.save();
      return "true";
      //true means, friend id has been remove successfully..
    } catch (err) {
      console.log("friend not found");
      console.log(err);
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
      return "false";
      //next(err);
    }
    //where to write return false, err m aane k baad return hoga false??
    //next we call wapis bhi aati h??
    //where to return false..in catch or try..
    //where we should return false message, if not removed the friends or user..??
  },
  /*
  addUser(args, req){
    
      const name=args.userInput.name;
  }
      */
};
