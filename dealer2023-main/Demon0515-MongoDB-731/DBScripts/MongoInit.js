/*
 Navicat Premium Data Transfer

 Source Server         : localMongo
 Source Server Type    : MongoDB
 Source Server Version : 60003
 Source Host           : localhost:27017
 Source Schema         : CardGame

 Target Server Type    : MongoDB
 Target Server Version : 60003
 File Encoding         : 65001

 Date: 15/05/2023 21:33:26
*/


// ----------------------------
// Collection structure for Memberships
// ----------------------------
db.getCollection("Memberships").drop();
db.createCollection("Memberships");

// ----------------------------
// Documents of Memberships
// ----------------------------
db.getCollection("Memberships").insert([ {
    _id: ObjectId("6461dd008a5a000025003a72"),
    Name: "Free",
    PlanId: 1,
    Description: "Save Game History",
    "Month_Value_In_Cash": 0,
    "Month_Value_In_Token": 0,
    "Annual_Value_In_Cash": 0,
    "Annual_Value_In_Token": 0
} ]);
db.getCollection("Memberships").insert([ {
    _id: ObjectId("6461dd468a5a000025003a73"),
    Name: "Basic",
    PlanId: 2,
    Description: "1000 tokens/month for in-game purchases. Enough tokens for 4 games with video each month*",
    "Month_Value_In_Cash": 14.99,
    "Month_Value_In_Token": 1000,
    "Annual_Value_In_Cash": 149.9,
    "Annual_Value_In_Token": 12000
} ]);
db.getCollection("Memberships").insert([ {
    _id: ObjectId("6461dee18a5a000025003a74"),
    Name: "Premium",
    PlanId: 3,
    Description: "2000 tokens/month for in-game purchases. Enough tokens for 8 games with video each month*",
    "Month_Value_In_Cash": 24.99,
    "Month_Value_In_Token": 2000,
    "Annual_Value_In_Cash": 249.99,
    "Annual_Value_In_Token": 24000
} ]);
db.getCollection("Memberships").insert([ {
    _id: ObjectId("6461dfc78a5a000025003a75"),
    Name: "Deluxe",
    PlanId: 4,
    Description: "4000 tokens/month for in-game purchases. Enough tokens for 16 games with video each month*",
    "Month_Value_In_Cash": 39.99,
    "Month_Value_In_Token": 4000,
    "Annual_Value_In_Cash": 249.99,
    "Annual_Value_In_Token": 48000
} ]);
