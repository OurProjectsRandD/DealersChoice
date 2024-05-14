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

 Date: 30/06/2023 17:24:51
*/


// ----------------------------
// Collection structure for Assets
// ----------------------------
db.getCollection("Assets").drop();
db.createCollection("Assets");

// ----------------------------
// Documents of Assets
// ----------------------------
db.getCollection("Assets").insert([ {
    _id: ObjectId("649e5b7b39290bce2025588f"),
    UserId: "d07b9b09-3123-4c12-aa30-304b2a642e61",
    Tokens: NumberInt("50"),
    VideoTime: NumberInt("25"),
    MembershipPlanId: NumberInt("1"),
    MembershipName: "Free",
    LastMembershipBillDate: ISODate("2023-06-30T04:35:07.099Z"),
    BillingPeriod: NumberInt("0")
} ]);

// ----------------------------
// Collection structure for Roles
// ----------------------------
db.getCollection("Roles").drop();
db.createCollection("Roles");

// ----------------------------
// Documents of Roles
// ----------------------------
db.getCollection("Roles").insert([ {
    _id: UUID("d54847cf-3df3-47db-97e2-51aac3f8dc06"),
    Name: "Admin",
    NormalizedName: "ADMIN",
    ConcurrencyStamp: null,
    Version: NumberInt("1"),
    Claims: [ ]
} ]);

// ----------------------------
// Collection structure for Users
// ----------------------------
db.getCollection("Users").drop();
db.createCollection("Users");

// ----------------------------
// Documents of Users
// ----------------------------
db.getCollection("Users").insert([ {
    _id: UUID("d07b9b09-3123-4c12-aa30-304b2a642e61"),
    LoggedInCnt: 0,
    UserName: "StephenChurchville",
    NormalizedUserName: "STEPHENCHURCHVILLE",
    Email: "administrator@stephen.com",
    NormalizedEmail: "ADMINISTRATOR@STEPHEN.COM",
    EmailConfirmed: false,
    PasswordHash: "AQAAAAIAAYagAAAAECMvsym7wKvRRGRp3LkfRSZIfKspAAH9fS4aJomZTmecSQtvxlf9McGeT7kWEfUX8A==",
    SecurityStamp: "353WZF2UMSLCC2E4BVZZ3DB6FFHVUWAB",
    ConcurrencyStamp: "40165ec8-f071-4239-9cc0-5bc4522eb054",
    PhoneNumber: null,
    PhoneNumberConfirmed: false,
    TwoFactorEnabled: false,
    LockoutEnd: null,
    LockoutEnabled: true,
    AccessFailedCount: NumberInt("0"),
    Version: NumberInt("1"),
    CreatedOn: ISODate("2023-06-30T04:35:06.935Z"),
    Claims: [ ],
    Roles: [
        UUID("d54847cf-3df3-47db-97e2-51aac3f8dc06")
    ],
    Logins: [ ],
    Tokens: [ ],
    DisplayName: "StephenC",
    FirstName: "Stephen",
    LastName: "Churchville",
    ImageFileName: ""
} ]);
