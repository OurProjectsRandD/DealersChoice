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

 Date: 30/06/2023 09:02:18
*/


// ----------------------------
// Collection structure for Roles
// ----------------------------
db.getCollection("Roles").drop();
db.createCollection("Roles");

// ----------------------------
// Documents of Roles
// ----------------------------
db.getCollection("Roles").insert([ {
    _id: UUID("6759607a-d5af-4b27-830a-12a3b37f59bd"),
    Name: "User",
    NormalizedName: "USER",
    ConcurrencyStamp: null,
    Version: NumberInt("1"),
    Claims: [ ]
} ]);
db.getCollection("Roles").insert([ {
    _id: UUID("d54847cf-3df3-47db-97e2-51aac3f8dc06"),
    Name: "Admin",
    NormalizedName: "ADMIN",
    ConcurrencyStamp: null,
    Version: NumberInt("1"),
    Claims: [ ]
} ]);
