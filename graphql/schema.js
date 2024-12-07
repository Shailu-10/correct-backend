const { buildSchema } = require("graphql");
//return type of hello is string
// ! means required
//Rootquery will contain functions that telling return type
//input is the input we expect from frontend
/*

simple type user{
    //is used to define user or anything else
}
    type query{
    //will define function to execute and what they will return
    ex: createUser(inputfor:inputforcreateuser): User
    //createUser is the function to be executed for fetching data
    //and input passed will be input for create user and it will return user
    
    }
    type mutation{

    }
    here we defining schema, then we have to make resolvers for them

    //query return 
*/
module.exports = buildSchema(`
    type userSchema{
        _id:ID!
        name:String!
        friends:[String]
    }
    input forCreatingUser{
        name:String!
        friends:String
    }
   
    type Mutation{
        addUser(userInput: forCreatingUser) : userSchema
        mutualFriends(curr_user_id:String!,friend_user_id:String!):[userSchema]
        showFriends(curr_user_id:String!): [userSchema]
        addFriend(curr_user_id:String!,friend_user_id:String!): userSchema
        deleteUser(curr_user_id:String!):String
        deleteFriend(curr_user_id:String!,friend_user_id:String!):String
    }
    type RootQuery{
        showAllDocument:[userSchema]
        userDetail(curr_user_id:String!):userSchema
    }
    schema{
        query: RootQuery
        mutation: Mutation   
    }
    `);
//query doesn't take any paramerters
/*
        type Query {
        getUsers: [User!]!
        }

        type User {
        id: ID!
        name: String!
        email: String!
        }
    */
