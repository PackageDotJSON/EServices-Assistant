const express = require("express");
const dotenv = require("dotenv");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const db2 = require("ibm_db");
const oracledb = require("oracledb");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const fastCsv = require("fast-csv");
const ws = fs.createWriteStream("ProcessErrorFile.csv");
const ws2 = fs.createWriteStream("BankUsageReportFile.csv");
const ws3 = fs.createWriteStream("CtcComparisonFile.csv");
const ws4 = fs.createWriteStream("AppliedCtcReport.csv");
const ws5 = fs.createWriteStream("CtcFilingStatusReport.csv");
const ws6 = fs.createWriteStream("BankTransactionLog.csv");
const xlsxFile = require("read-excel-file/node");
const nodemailer = require("nodemailer");
const http = require("http");
var generatedKey;
var isGeneratedKeyValid;

dotenv.config();

var count = 0;

var secret = Buffer.from(process.env.SECPKey, "base64").toString("ascii");
var secp = Buffer.from(process.env.SECPDBKey, "base64").toString("ascii");
var secp_2 = Buffer.from(process.env.SECP2DBKey, "base64").toString("ascii");
var secp_3 = Buffer.from(process.env.SECP3DBKey, "base64").toString("ascii");
var secp_4 = Buffer.from(process.env.SECP4DBKey, "base64").toString("ascii");
var secp_5 = Buffer.from(process.env.SECP5DBKey, "base64").toString("ascii");
var secp_6 = Buffer.from(process.env.SECP6DBKey, "base64").toString("ascii");
var passwordKey = Buffer.from(
  process.env.PASSWORD_ENCRYPTION_KEY,
  "base64"
).toString("ascii");
var oracleUser = Buffer.from(process.env.ORACLEDB_USER, "base64").toString(
  "ascii"
);
var oraclePassword = Buffer.from(
  process.env.ORACLEDB_PASSWORD,
  "base64"
).toString("ascii");
var oracleConnectString = Buffer.from(
  process.env.ORACLEDB_CONNECT_STRING,
  "base64"
).toString("ascii");

try {
  oracledb.initOracleClient({
    libDir: `${process.env.ORACLE_CLIENT_LOCATION}`,
  });
} catch (err) {
  console.log(
    "Error occurred while trying to link to the Oracle Instant Client " +
      err.message
  );
  process.exit(1);
}

var transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  tls: {
    rejectUnauthorized: false,
  },
});

transporter.verify(function (error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log("Server is ready to take our messages");
  }
});

router.post("/login", async (req, res) => {
  const email = req.body.usermail.toUpperCase();
  const passCode = req.body.passcode;
  const userip = req.ip;
  const searchDB = `SELECT UPPER("email"),
                           "name",
                           "samaccount",
                           DECRYPT_CHAR("password", '${passwordKey}') as "password",
                           "userrights",
                           "location"
                    FROM USER_CREDENTIALS
                    WHERE UPPER("email") = ?`;

  db2.open(secp, (err, conn) => {
    if (!err) {
      console.log("Connected Successfully");
    } else {
      console.log("Error occurred while connecting with DB2: " + err.message);
    }
    conn.query(searchDB, [email], async (err, results) => {
      if (!err) {
        if (results.length === 0) {
          const responsePayload = {
            access: "UnAuthorized",
          };
          res.send(responsePayload);
        } else {
          samaccount = results[0].samaccount;

          // const waitingForResult = await verifyLogin(samaccount, userip);

          const waitingForResult = 1;

          if (waitingForResult === 1) {
            if (results[0].password === passCode) {
              const token = jwt.sign({ id: email }, secret, {
                expiresIn: "2h",
              });
              if (results[0].userrights === "full") {
                count++;
                console.log(`The number of users logged in today: ${count}`);
                res.setHeader(
                  "Access-Control-Expose-Headers",
                  "x-access-token"
                );
                res.setHeader("x-access-token", token);
                const responsePayload = {
                  access: "Full Authorization",
                  name: results[0].name,
                  location: results[0].location,
                };
                res.send(responsePayload);
              } else if (results[0].userrights === "partial") {
                count++;
                console.log(`The number of users logged in today: ${count}`);
                res.setHeader(
                  "Access-Control-Expose-Headers",
                  "x-access-token"
                );
                res.setHeader("x-access-token", token);
                const responsePayload = {
                  access: "Partial Authorization",
                  name: results[0].name,
                  location: results[0].location,
                };
                res.send(responsePayload);
              } else if (results[0].userrights === "minimum") {
                count++;
                console.log(`The number of users logged in today: ${count}`);
                res.setHeader(
                  "Access-Control-Expose-Headers",
                  "x-access-token"
                );
                res.setHeader("x-access-token", token);
                const responsePayload = {
                  access: "Minimum Authorization",
                  name: results[0].name,
                  location: results[0].location,
                };
                res.send(responsePayload);
              } else {
                const responsePayload = {
                  access: "Rights have not been granted yet",
                  name: results[0].name,
                  location: results[0].location,
                };
                res.send(responsePayload);
              }
            } else {
              const responsePayload = {
                access: "UnAuthorized",
                name: results[0].name,
                location: results[0].location,
              };
              res.send(responsePayload);
            }
          } else {
            const responsePayload = {
              access: "UnAuthorized",
              name: results[0].name,
              location: results[0].location,
            };
            res.send(responsePayload);
          }
        }
      } else {
        console.log(
          "Error occurred while searching for all the data: " + err.message
        );
      }

      conn.close((err) => {
        if (!err) {
          console.log("Connection closed with the database");
        } else {
          console.log(
            "Error occurred while trying to close the connection with the database " +
              err.message
          );
        }
      });
    });
  });
});

function verifyLogin(samAccount, ipaddress) {
  return new Promise((resolve, reject) => {
    const header = { caller: `${samAccount}`, "ip-address": `${ipaddress}` };

    http
      .get(
        `http://srtstws:8080/RestAd/v1/ad/${samAccount}`,
        { headers: header },
        (res) => {
          let data = "";

          res.on("data", (chunk) => {
            data += chunk;
          });

          res.on("end", () => {
            newdata = JSON.parse(data);
            if (newdata.accountStatus === true) {
              resolve(1);
            } else {
              resolve(0);
            }
          });
        }
      )
      .on("error", (err) => {
        console.log("Error: " + err.message);
      });
  });
}

router.post("/forgot-password", (req, res) => {
  const email = req.body.userEmail.toUpperCase();
  const searchDB = `SELECT UPPER("email")
                    FROM USER_CREDENTIALS
                    WHERE UPPER("email") = ?`;

  db2.open(secp, (err, conn) => {
    if (!err) {
      console.log("Connected Successfully");
    } else {
      console.log("Error occurred while connecting with DB2: " + err.message);
    }

    conn.query(searchDB, [email], (err, results) => {
      if (!err) {
        results.length === 0
          ? res.send("Email does not exist")
          : sendVerificationKey(res, email).catch(console.error);
      } else {
        console.log(
          "Error occurred while searching for all the data: " + err.message
        );
      }

      conn.close((err) => {
        if (!err) {
          console.log("Connection closed with the database");
        } else {
          console.log(
            "Error occurred while trying to close the connection with the database " +
              err.message
          );
        }
      });
    });
  });
});

async function sendVerificationKey(res, email) {
  generatedKey = Math.floor(Math.random() * 9999) + 1000;
  email = email.toLowerCase();

  const token = jwt.sign({ id: email }, secret, { expiresIn: "5m" });

  let info = await transporter.sendMail({
    from: '"EServices Assistant" <admin@secp.gov.pk>', // sender address
    to: `${email}`, // list of receivers
    subject: "Password Reset", // Subject line
    html: `<p>Hello, <br />
    &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; We have received a request to reset the password for your EServices Assistant account.
    To reset your password, copy and paste the verification code into the EServices Assistant application. <br />
    <br />Your <b>Verification Code</b> is: <h3>${generatedKey}</h3> Or, you can click on the link below: <br /><br />
    <a href="http://${process.env.SMTP_SERVER}/#/forgotpassword?verificationcodevalid=true&useremail=${email}&token=${token}">http://${process.env.SMTP_SERVER}/#/forgotpassword?${token}</a>
    <br /><br /><br /><i>
    This is an automatically generated email –
    please do not reply to it.</i></p>`, // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

  res.send("Email found");
}

router.post("/verify-code", (req, res) => {
  const id = req.body.verificationCode;
  id === generatedKey
    ? ((isGeneratedKeyValid = true), res.send("Verified"))
    : res.send("Invalid");
});

router.put("/create-new-password", (req, res) => {
  const key = req.query.id;
  const key2 = req.query.id2;
  const key3 = req.query.id3;

  const token = req.get("key");

  if (!token) {
    res.json("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function (err, decoded) {
    if (!err || isGeneratedKeyValid) {
      const updateData = `UPDATE USER_CREDENTIALS
                          SET "${key3}" = ENCRYPT('${key}', '${passwordKey}')
                          WHERE "email" = ?`;

      db2.open(secp, (err, conn) => {
        if (!err) {
          console.log("Connected Successfully");
        } else {
          console.log(
            "Error occurred while connecting to the database" + err.message
          );
        }

        conn.query(updateData, [key2], (err, results) => {
          if (!err) {
            res.send("Data updated successfully");
          } else {
            console.log(
              "Error occurred while updating the user profile data" +
                err.message
            );
          }

          conn.close((err) => {
            if (!err) {
              console.log("Connection closed with the database");
            } else {
              console.log(
                "Error occurred while trying to close the connection with the database" +
                  err.message
              );
            }
          });
        });
      });
    } else {
      res.json("Authorization Failed. Link Expired. Please Try Again.");
    }
  });
});

router.get("/allow-user-rights", (req, res) => {
  calculateIP(req.ip, "/allow-user-rights");

  const token = req.get("key");

  if (!token) {
    res.json("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function (err, decoded) {
    if (!err) {
      const key = req.query.id;

      const fetchRights = `SELECT USER_CREDENTIALS."name",
                                  USER_CREDENTIALS_2."roles",
                                  USER_CREDENTIALS_2."email",
                                  USER_CREDENTIALS_2."routes"
                           FROM ESUSER.USER_CREDENTIALS
                                  INNER JOIN USER_CREDENTIALS_2 on USER_CREDENTIALS."email" = USER_CREDENTIALS_2."email"
                           WHERE USER_CREDENTIALS."email" = ?
                           ORDER BY "roles"`;

      db2.open(secp, (err, conn) => {
        if (!err) {
          console.log("Connected Successfully");
        } else {
          console.log(
            "Error occurred while connecting to the database " + err.message
          );
        }
        conn.query(fetchRights, [key], (err, results) => {
          if (!err) {
            res.send(results);
          } else {
            console.log(
              "Error occurred while fetch user rights " + err.message
            );
          }

          conn.close((err) => {
            if (!err) {
              console.log("Connection closed with the database");
            } else {
              console.log(
                "Error occurred while trying to close the connection with the database " +
                  err.message
              );
            }
          });
        });
      });
    } else {
      res.json("Authorization Failed. Token Expired. Please Login Again.");
    }
  });
});

function verifyEmail(mailToUpper) {
  const checkEmail = `SELECT UPPER("email")
                      from USER_CREDENTIALS
                      WHERE UPPER("email") = ?`;

  return new Promise((resolve, reject) => {
    db2.open(secp, (err, conn) => {
      if (!err) {
        console.log("Connected Successfully");
      } else {
        console.log(
          "Error occurred while connecting to the database " + err.message
        );
      }

      conn.query(checkEmail, [mailToUpper], (err, results) => {
        if (!err) {
          if (results.length > 0) {
            resolve(0);
          } else {
            resolve(1);
          }
        }

        conn.close((err) => {
          if (!err) {
            console.log("Connection closed with the database");
          } else {
            console.log(
              "Error occurred while trying to close the connection with the database " +
                err.message
            );
          }
        });
      });
    });
  });
}

router.post("/post-data", async (req, res) => {
  calculateIP(req.ip, "/post-data");

  const name = req.body.fullPersonName;
  const mail = req.body.mailPerson;
  const mailToUpper = req.body.mailPerson.toUpperCase();
  const code = req.body.codePerson;
  const employeeid = req.body.employeeidPerson;
  const samaccount = req.body.samaccountPerson;
  const activedirectory = req.body.activeDirectoryPerson;
  const jobrole = req.body.jobRolePerson;
  const jobstatus = req.body.jobStatusPerson;
  const location = req.body.locationPerson;
  const department = req.body.departmentPerson;
  const adminrights = req.body.adminRightsPerson;
  var additionalrights = req.body.additionalRightsPerson;
  var roles = [];
  var userRoles = [];

  var userAdditionalRights = [];

  if (adminrights !== "minimum") {
    for (var i = 0; i < additionalrights.length; i++) {
      roles[i] = additionalrights[i].split(",");
    }

    for (var i = 0; i < additionalrights.length; i++) {
      userRoles.push(roles[i][0]);
      userAdditionalRights.push(roles[i][1]);
    }
  }

  const addData = `INSERT INTO USER_CREDENTIALS ("name", "email", "password", "userdesignation", "userstatus",
                                                 "activedirectoryaccount", "employeeid", "location", "userrights",
                                                 "samaccount", "department")
                   VALUES (?, ?, ENCRYPT('${code}', '${passwordKey}'), ?, ?, ?, ?, ?, ?, ?, ?)`;
  const addData2 = `INSERT INTO USER_CREDENTIALS_2 ("roles", "email", "routes")
                    VALUES (?, ?, ?)`;

  const waitingForResult = await verifyEmail(mailToUpper);

  if (waitingForResult === 1) {
    db2.open(secp, (err, conn) => {
      if (!err) {
        console.log("Connected Successfully");
      } else {
        console.log(
          "Error occurred while connecting to the database " + err.message
        );
      }

      conn.query(
        addData,
        [
          name,
          mail,
          jobrole,
          jobstatus,
          activedirectory,
          employeeid,
          location,
          adminrights,
          samaccount,
          department,
        ],
        (err, results) => {
          if (!err) {
            console.log("User data added successfully");
          } else {
            console.log(
              "Error occurred while adding new user data " + err.message
            );
          }

          conn.close((err) => {
            if (!err) {
              console.log("Connection closed with the database");
            } else {
              console.log(
                "Error occurred while trying to close the connection with the database " +
                  err.message
              );
            }
          });
        }
      );

      var mailArray = [];
      for (var i = 0; i < userRoles.length; i++) {
        mailArray.push(mail);
      }

      if (adminrights !== "minimum") {
        for (var i = 0; i < userRoles.length; i++) {
          conn.query(
            addData2,
            [userRoles[i], mail, userAdditionalRights[i]],
            (err, results) => {
              if (!err) {
                console.log("User data added successfully");
              } else {
                console.log(
                  "Error occurred while adding new user data " + err.message
                );
              }

              conn.close((err) => {
                if (!err) {
                  console.log("Connection closed with the database");
                } else {
                  console.log(
                    "Error occurred while trying to close the connection with the database " +
                      err.message
                  );
                }
              });
            }
          );
        }
      }

      res.send("User data added successfully");
    });
  } else {
    res.send("Email already exists");
  }
});

router.get("/total-data", (req, res) => {
  const token = req.get("key");

  if (!token) {
    res.json("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function (err, decoded) {
    if (!err) {
      const searchCalData = `SELECT COUNT("id") total
                             FROM USER_CREDENTIALS`;

      db2.open(secp, (err, conn) => {
        if (!err) {
          console.log("Connected Successfully");
        } else {
          console.log(
            "Error occurred while connecting to the database " + err.message
          );
        }

        conn.query(searchCalData, (err, results) => {
          if (!err) {
            res.send(results);
          } else {
            console.log(
              "Error occurred while fetching the total data of users: " +
                err.message
            );
          }

          conn.close((err) => {
            if (!err) {
              console.log("Connection closed with the database");
            } else {
              console.log(
                "Error occurred while trying to close the connection with the database " +
                  err.message
              );
            }
          });
        });
      });
    } else {
      res.json("Authorization Failed. Token Expired. Please Login Again.");
    }
  });
});

router.get("/admin-data", (req, res) => {
  const token = req.get("key");

  if (!token) {
    res.json("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function (err, decoded) {
    if (!err) {
      var pagLimit = req.query.id;
      var pagData = req.query.id2;

      const searchAdminData = `SELECT "id",
                                      "name",
                                      "email",
                                      "userdesignation",
                                      "userstatus",
                                      "activedirectoryaccount",
                                      "employeeid",
                                      "location",
                                      "department",
                                      "samaccount",
                                      "userrights"
                               FROM USER_CREDENTIALS
                               ORDER BY "id" LIMIT ?, ?`;

      db2.open(secp, (err, conn) => {
        if (!err) {
          console.log("Connected Successfully");
        } else {
          console.log(
            "Error occurred while connecting to the database " + err.message
          );
        }

        conn.query(searchAdminData, [pagData, pagLimit], (err, results) => {
          if (!err) {
            res.send(results);
          } else {
            console.log(
              "Error occurred while fetching administration data " + err.message
            );
          }

          conn.close((err) => {
            if (!err) {
              console.log("Connection closed with the database");
            } else {
              console.log(
                "Error occurred while trying to close the connection with the database " +
                  err.message
              );
            }
          });
        });
      });
    } else {
      res.json("Authorization Failed. Token Expired. Please Login Again.");
    }
  });
});

router.get("/sub-admin-data", (req, res) => {
  const token = req.get("key");

  if (!token) {
    res.json("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function (err, decoded) {
    if (!err) {
      const userMail = req.query.id.toUpperCase();

      const fetchAdminRights = `SELECT USER_CREDENTIALS_2."roles"
                                FROM ESUSER.USER_CREDENTIALS
                                       INNER JOIN USER_CREDENTIALS_2 ON
                                  USER_CREDENTIALS."email" = USER_CREDENTIALS_2."email"
                                WHERE UPPER(USER_CREDENTIALS."email") = ?`;

      db2.open(secp, (err, conn) => {
        if (!err) {
          console.log("Connected Successfully");
        } else {
          console.log(
            "Error occurred while connecting to the database " + err.message
          );
        }

        conn.query(fetchAdminRights, [userMail], (err, results) => {
          if (!err) {
            res.send(results);
          } else {
            console.log(
              "Error occurred while fetching sub administrative rights " +
                err.message
            );
          }

          conn.close((err) => {
            if (!err) {
              console.log("Connection closed with the database");
            } else {
              console.log(
                "Error occurred while trying to close the connection with the database " +
                  err.message
              );
            }
          });
        });
      });
    }
  });
});

router.put("/modify-rights", (req, res) => {
  calculateIP(req.ip, "/modify-rights");

  const token = req.get("key");

  if (!token) {
    res.json("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function (err, decoded) {
    if (!err) {
      const rights = req.query.id;
      const email = req.query.id2;

      const modifyrights = `UPDATE USER_CREDENTIALS
                            SET "userrights" = ?
                            WHERE "email" = ?`;

      db2.open(secp, (err, conn) => {
        if (!err) {
          console.log("Connected Successfully");
        } else {
          console.log(
            "Error occurred while connecting to the database " + err.message
          );
        }
        conn.query(modifyrights, [rights, email], (err, results) => {
          if (!err) {
            res.send(results);
          } else {
            console.log(
              "Error occurred while updaing administrative rights " +
                err.message
            );
          }

          conn.close((err) => {
            if (!err) {
              console.log("Connection closed with the database");
            } else {
              console.log(
                "Error occurred while trying to close the connection with the database " +
                  err.message
              );
            }
          });
        });
      });
    } else {
      res.json("Authorization Failed. Token Expired. Please Login Again.");
    }
  });
});

router.post("/modify-sub-rights", (req, res) => {
  calculateIP(req.ip, "/modify-sub-rights");

  const token = req.get("key");

  if (!token) {
    res.json("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function (err, decoded) {
    if (!err) {
      const rightsToAdd = req.body.rights;
      const rolesToAdd = req.body.roles;
      const userMail = req.query.id;

      const insertData = `INSERT INTO USER_CREDENTIALS_2 ("roles", "email", "routes")
                          VALUES (?, ?, ?)`;

      db2.open(secp, (err, conn) => {
        if (!err) {
          console.log("Connected Successfully");
        } else {
          console.log(
            "Error occurred while connecting to the database " + err.message
          );
        }

        for (var i = 0; i <= rightsToAdd.length; i++) {
          conn.query(
            insertData,
            [rightsToAdd[i], userMail, rolesToAdd[i]],
            (err, results) => {
              if (!err) {
                console.log(results);
              } else {
                console.log(
                  "Error occurred while inserting the new roles of the user" +
                    err.message
                );
              }

              conn.close((err) => {
                if (!err) {
                  console.log("Connection closed with the database");
                } else {
                  console.log(
                    "Error occurred while trying to close the connection with the database " +
                      err.message
                  );
                }
              });
            }
          );
        }
        res.json("User data added successfully");
      });
    } else {
      res.json("Authorization Failed. Token Expired. Please Login Again.");
    }
  });
});

router.delete("/delete-sub-rights", (req, res) => {
  calculateIP(req.ip, "/delete-sub-rights");

  const token = req.get("key");

  if (!token) {
    res.json("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function (err, decoded) {
    if (!err) {
      var deleteRoles = JSON.parse(req.query.id);
      const userMail = req.query.id2;

      const deleteData = `DELETE
                          FROM USER_CREDENTIALS_2
                          where "roles" = ?
                            AND "email" = ?`;

      db2.open(secp, (err, conn) => {
        if (!err) {
          console.log("Connected Successfully");
        } else {
          console.log(
            "Error occurred while connecting to the database " + err.message
          );
        }

        for (var i = 0; i <= deleteRoles.length; i++) {
          conn.query(deleteData, [deleteRoles[i], userMail], (err, results) => {
            if (!err) {
              console.log(results);
            } else {
              console.log(
                "Error occurred while deleting the user role " + err.message
              );
            }

            conn.close((err) => {
              if (!err) {
                console.log("Connection closed with the database");
              } else {
                console.log(
                  "Error occurred while trying to close the connection with the database " +
                    err.message
                );
              }
            });
          });
        }
        res.json("User data added successfully");
      });
    } else {
      res.json("Authorization Failed. Token Expired. Please Login Again.");
    }
  });
});

router.get("/search-data", (req, res) => {
  calculateIP(req.ip, "/search-data");

  const token = req.get("key");

  if (!token) {
    res.json("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function (err, decoded) {
    if (!err) {
      const searchElement = req.query.id.toUpperCase();

      const searchData = `SELECT "id",
                                 "name",
                                 "email",
                                 "userdesignation",
                                 "userstatus",
                                 "activedirectoryaccount",
                                 "employeeid",
                                 "location",
                                 "department",
                                 "samaccount",
                                 "userrights"
                          FROM USER_CREDENTIALS
                          WHERE UPPER("name") LIKE '%${searchElement}%'
                             OR UPPER("email")
                            LIKE '%${searchElement}%'
                             OR UPPER("userdesignation") LIKE '%${searchElement}%'
                             OR UPPER("userstatus") LIKE '%${searchElement}%'
                             OR UPPER("activedirectoryaccount") LIKE '%${searchElement}%'
                             OR UPPER("employeeid") LIKE '%${searchElement}%'
                             OR UPPER("location") LIKE '%${searchElement}%'
                             OR UPPER("department") LIKE '%${searchElement}%'
                             OR UPPER("samaccount") LIKE '%${searchElement}%'
                             OR UPPER("userrights") LIKE '%${searchElement}%'`;

      db2.open(secp, (err, conn) => {
        if (!err) {
          console.log("Connected Successfully");
        } else {
          console.log(
            "Error occurred while connecting to the database " + err.message
          );
        }

        conn.query(searchData, (err, results) => {
          if (!err) {
            res.send(results);
          } else {
            console.log(
              "Error occurred while searching for the given data " + err.message
            );
          }

          conn.close((err) => {
            if (!err) {
              console.log("Connection closed with the database");
            } else {
              console.log(
                "Error occurred while trying to close the connection with the database " +
                  err.message
              );
            }
          });
        });
      });
    } else {
      res.json("Authorization Failed. Token Expired. Please Login Again.");
    }
  });
});

router.get("/get-eservices-data", (req, res) => {
  const token = req.get("key");

  if (!token) {
    res.json("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function (err, decoded) {
    if (!err) {
      const fetchData = "SELECT * FROM ESUSER.INTERNAL_USER_PROFILE";

      db2.open(secp, (err, conn) => {
        if (!err) {
          console.log("Connected Successfully");
        } else {
          console.log(
            "Error occurred while connecting to the database" + err.message
          );
        }

        conn.query(fetchData, (err, results) => {
          if (!err) {
            res.send(results);
          } else {
            console.log(
              "Error occurred while fetching the EServices Management Data" +
                err.message
            );
          }

          conn.close((err) => {
            if (!err) {
              console.log("Connection closed with the database");
            } else {
              console.log(
                "Error occurred while trying to close the connection with the database" +
                  err.message
              );
            }
          });
        });
      });
    } else {
      res.json("Authorization Failed. Token Expired. Please Login Again.");
    }
  });
});

router.get("/get-roles-lookup", (req, res) => {
  const token = req.get("key");

  if (!token) {
    res.json("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function (err, decoded) {
    if (!err) {
      const fetchRoles = `SELECT ROW_ID           as "id",
                                 ROLE             as "itemName",
                                 ROLE_ID          as "roleId",
                                 APPLICATION_NAME as "applicationName"
                          FROM ESUSER.ROLES_LOOKUP`;

      db2.open(secp, (err, conn) => {
        if (!err) {
          console.log("Connected Successfully");
        } else {
          console.log(
            "Error occurred while connecting to the database" + err.message
          );
        }

        conn.query(fetchRoles, (err, results) => {
          if (!err) {
            res.send(results);
          } else {
            console.log(
              "Error occurred while fetching the EServices Management Roles" +
                err.message
            );
          }

          conn.close((err) => {
            if (!err) {
              console.log("Connection closed with the database");
            } else {
              console.log(
                "Error occurred while trying to close the connection with the database" +
                  err.message
              );
            }
          });
        });
      });
    } else {
      res.json("Authorization Failed. Token Expired. Please Login Again.");
    }
  });
});

router.get("/get-single-eservices-data", (req, res) => {
  const token = req.get("key");

  if (!token) {
    res.json("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function (err, decoded) {
    if (!err) {
      const key = req.query.id;

      const fetchSingleUserData = `SELECT USER_ID,
                                          USER_NAME,
                                          F_NAME,
                                          L_NAME,
                                          USER_STATUS,
                                          USER_CELL,
                                          USER_PICTURE,
                                          USER_EMAIL,
                                          IS_MIGRATED_USER,
                                          CREATED_BY,
                                          CREATED_WHEN,
                                          MODIFIED_BY,
                                          MODIFIED_WHEN,
                                          GENDER,
                                          CRO,
                                          BUSINESS_CATEGORY,
                                          EMPLOYEE_TYPE,
                                          AD_USER,
                                          DECRYPT_CHAR(PASSWORD, '${passwordKey}') as PASSWORD,
                                          DESIGNATION,
                                          EMPLOYEE_ID,
                                          DIVISION,
                                          DEPARTMENT,
                                          LOCATION
                                   FROM ESUSER.INTERNAL_USER_PROFILE
                                   WHERE USER_ID = ?`;

      db2.open(secp, (err, conn) => {
        if (!err) {
          console.log("Connected Successfully");
        } else {
          console.log(
            "Error occurred while connecting to the database" + err.message
          );
        }

        conn.query(fetchSingleUserData, [key], (err, results) => {
          if (!err) {
            res.send(results);
          } else {
            console.log(
              "Error occurred while fetching the Single EServices Management Data" +
                err.message
            );
          }

          conn.close((err) => {
            if (!err) {
              console.log("Connection closed with the database");
            } else {
              console.log(
                "Error occurred while trying to close the connection with the database" +
                  err.message
              );
            }
          });
        });
      });
    } else {
      res.json("Authorization Failed. Token Expired. Please Login Again.");
    }
  });
});

router.get("/get-single-role-lookup", (req, res) => {
  const token = req.get("key");

  if (!token) {
    res.json("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function (err, decoded) {
    if (!err) {
      const key = req.query.id.toUpperCase();

      const fetchSingleRole = `SELECT *
                               FROM ESUSER.PROCESS_ASSIGNMENT
                               WHERE USER_ID = ?`;

      db2.open(secp, (err, conn) => {
        if (!err) {
          console.log("Connected Successfully");
        } else {
          console.log(
            "Error occurred while connecting to the database" + err.message
          );
        }

        conn.query(fetchSingleRole, [key], (err, results) => {
          if (!err) {
            const fetchSingleRoleData = `SELECT ROW_ID           as "id",
                                                ROLE             as "itemName",
                                                ROLE_ID          as "roleId",
                                                APPLICATION_NAME as "applicationName"
                                         FROM ESUSER.ROLES_LOOKUP
                                         WHERE ROLE_ID = ?`;
            finalResult = [];

            for (let i = 0; i < results.length; i++) {
              conn.query(
                fetchSingleRoleData,
                [results[i].ROLE_ID],
                (err, output) => {
                  if (!err) {
                    output[0] !== null &&
                      output[0] !== undefined &&
                      finalResult.push(output[0]);
                    i === results.length - 1 && res.send(finalResult);
                  } else {
                    console.log(
                      "Error occurred while fetching the Single EServices Management Role" +
                        err.message
                    );
                  }
                }
              );
            }
          } else {
            console.log(
              "Error occurred while fetching the Single EServices Management Role" +
                err.message
            );
          }

          conn.close((err) => {
            if (!err) {
              console.log("Connection closed with the database");
            } else {
              console.log(
                "Error occurred while trying to close the connection with the database" +
                  err.message
              );
            }
          });
        });
      });
    } else {
      res.json("Authorization Failed. Token Expired. Please Login Again.");
    }
  });
});

router.get("/search-eservices-data", (req, res) => {
  const token = req.get("key");

  if (!token) {
    res.json("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function (err, decoded) {
    if (!err) {
      const key = req.query.id.toLowerCase();
      const fetchData = `SELECT *
                         FROM ESUSER.INTERNAL_USER_PROFILE
                         WHERE LOWER(USER_ID) LIKE '%${key}%'
                            OR LOWER(USER_STATUS) LIKE
                               '%${key}%'
                            OR LOWER(IS_MIGRATED_USER) LIKE '%${key}%'
                            OR LOWER(GENDER) LIKE '%${key}%'
                            OR LOWER(CRO) LIKE
                               '%${key}%'
                            OR LOWER(BUSINESS_CATEGORY) LIKE '%${key}%'
                            OR LOWER(EMPLOYEE_TYPE) LIKE '%${key}%'
                            OR LOWER(DESIGNATION) LIKE '%${key}%'
                            OR LOWER(DEPARTMENT) LIKE '%${key}%'
                            OR LOWER(LOCATION) LIKE '%${key}%'`;

      db2.open(secp, (err, conn) => {
        if (!err) {
          console.log("Connected Successfully");
        } else {
          console.log(
            "Error occurred while connecting to the database" + err.message
          );
        }

        conn.query(fetchData, (err, results) => {
          if (!err) {
            res.send(results);
          } else {
            console.log(
              "Error occurred while searching the EServices Management data" +
                err.message
            );
          }

          conn.close((err) => {
            if (!err) {
              console.log("Connection closed with the database");
            } else {
              console.log(
                "Error occurred while trying to close the connection with the database" +
                  err.message
              );
            }
          });
        });
      });
    } else {
      res.json("Authorization Failed. Token Expired. Please Login Again.");
    }
  });
});

router.post("/post-eservices-data", (req, res) => {
  const token = req.get("key");

  if (!token) {
    res.json("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function (err, decoded) {
    if (!err) {
      const {
        firstName,
        lastName,
        userId,
        userStatus,
        userCell,
        userEmail,
        isUserMigrated,
        createdBy,
        createdWhen,
        modifiedBy,
        modifiedWhen,
        userGender,
        userCro,
        businessCategory,
        employeeType,
        adUser,
        userPassword,
        employeeId,
        userDesignation,
        userDepartment,
        userLocation,
      } = req.body;

      const postData = `INSERT INTO ESUSER.INTERNAL_USER_PROFILE(USER_ID, USER_NAME, F_NAME, L_NAME, USER_STATUS,
                                                                 USER_CELL, USER_PICTURE, USER_EMAIL, IS_MIGRATED_USER,
                                                                 CREATED_BY, CREATED_WHEN, MODIFIED_BY, MODIFIED_WHEN,
                                                                 GENDER, CRO, BUSINESS_CATEGORY, EMPLOYEE_TYPE, AD_USER,
                                                                 PASSWORD, DESIGNATION, EMPLOYEE_ID, DIVISION,
                                                                 DEPARTMENT, LOCATION)
                        VALUES ('${userId.toUpperCase()}', '${
        firstName + " " + lastName
      }', '${firstName}', '${lastName}', '${userStatus}', ${userCell}, null, '${userEmail}',
                                '${isUserMigrated}', '${createdBy}', '${createdWhen}',
                                '${modifiedBy}', '${modifiedWhen}', '${userGender}', '${userCro}', '${businessCategory}
                                ', '${employeeType}', '${adUser}', ENCRYPT('${userPassword}', '${passwordKey}'),
                                '${userDesignation}', ${employeeId}, null, '${userDepartment}', '${userLocation}')`;

      db2.open(secp, (err, conn) => {
        if (!err) {
          console.log("Connected Successfully");
        } else {
          console.log(
            "Error occurred while connecting to the database" + err.message
          );
        }

        conn.query(postData, (err, results) => {
          if (!err) {
            res.send("Success");
          } else {
            console.log(
              "Error occurred while posting the EServices Management data" +
                err.message
            );
          }

          conn.close((err) => {
            if (!err) {
              console.log("Connection closed with the database");
            } else {
              console.log(
                "Error occurred while trying to close the connection with the database" +
                  err.message
              );
            }
          });
        });
      });
    } else {
      res.json("Authorization Failed. Token Expired. Please Login Again.");
    }
  });
});

router.post("/post-eservices-roles", (req, res) => {
  const token = req.get("key");

  if (!token) {
    res.json("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function (err, decoded) {
    if (!err) {
      const { userRoles, userId } = req.body;

      db2.open(secp, (err, conn) => {
        if (!err) {
          console.log("Connected Successfully");
        } else {
          console.log(
            "Error occurred while connecting to the database" + err.message
          );
        }

        const postRole = `INSERT INTO ESUSER.PROCESS_ASSIGNMENT(ROLE_ID, USER_ID, ALPHABET_ASSIGNMENT, APPLICATION_NAME)
                          VALUES (?, ?, ?, ?)`;

        for (let i = 0; i < userRoles.length; i++) {
          conn.query(
            postRole,
            [
              userRoles[i].roleId,
              userId.toUpperCase(),
              null,
              userRoles[i].applicationName,
            ],
            (err, output) => {
              if (!err) {
                i === userRoles.length - 1 && res.send("Success");
              } else {
                console.log(
                  "Error occurred while posting the EServices Management roles" +
                    err.message
                );
              }
            }
          );
        }
        conn.close((err) => {
          if (!err) {
            console.log("Connection closed with the database");
          } else {
            console.log(
              "Error occurred while trying to close the connection with the database" +
                err.message
            );
          }
        });
      });
    } else {
      res.json("Authorization Failed. Token Expired. Please Login Again.");
    }
  });
});

router.put("/update-eservices-data", (req, res) => {
  const token = req.get("key");

  if (!token) {
    res.json("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function (err, decoded) {
    if (!err) {
      const {
        firstName,
        lastName,
        userId,
        userStatus,
        userCell,
        userEmail,
        isUserMigrated,
        createdBy,
        createdWhen,
        modifiedBy,
        modifiedWhen,
        userGender,
        userCro,
        businessCategory,
        employeeType,
        adUser,
        userPassword,
        employeeId,
        userDesignation,
        userDepartment,
        userLocation,
      } = req.body;

      const updateData = `UPDATE ESUSER.INTERNAL_USER_PROFILE
                          SET USER_ID           = '${userId}',
                              USER_NAME         = '${
                                firstName + " " + lastName
                              }',
                              F_NAME            = '${firstName}',
                              L_NAME            = '${lastName}',
                              USER_STATUS       = '${userStatus}',
                              USER_CELL         = ${userCell},
                              USER_PICTURE      = null,
                              USER_EMAIL        = '${userEmail}',
                              IS_MIGRATED_USER  = '${isUserMigrated}',
                              CREATED_BY        = '${createdBy}',
                              CREATED_WHEN      = '${createdWhen}',
                              MODIFIED_BY       = '${modifiedBy}',
                              MODIFIED_WHEN     = '${modifiedWhen}',
                              GENDER            = '${userGender}',
                              CRO               = '${userCro}',
                              BUSINESS_CATEGORY = '${businessCategory}',
                              EMPLOYEE_TYPE     = '${employeeType}',
                              AD_USER           = '${adUser}',
                              PASSWORD          = ENCRYPT('${userPassword}', '${passwordKey}'),
                              DESIGNATION       = '${userDesignation}',
                              EMPLOYEE_ID       = ${employeeId},
                              DIVISION          = null,
                              DEPARTMENT        = '${userDepartment}',
                              LOCATION          = '${userLocation}'
                          WHERE AD_USER = '${adUser}'`;

      db2.open(secp, (err, conn) => {
        if (!err) {
          console.log("Connected Successfully");
        } else {
          console.log(
            "Error occurred while connecting to the database" + err.message
          );
        }

        conn.query(updateData, (err, results) => {
          if (!err) {
            res.send("Success");
          } else {
            console.log(
              "Error occurred while updating the EServices Management data" +
                err.message
            );
          }

          conn.close((err) => {
            if (!err) {
              console.log("Connection closed with the database");
            } else {
              console.log(
                "Error occurred while trying to close the connection with the database" +
                  err.message
              );
            }
          });
        });
      });
    } else {
      res.json("Authorization Failed. Token Expired. Please Login Again.");
    }
  });
});

router.put("/update-eservices-roles", (req, res) => {
  const token = req.get("key");

  if (!token) {
    res.json("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function (err, decoded) {
    if (!err) {
      const { userRoles, userId } = req.body;

      const deletePrevData = `DELETE
                              FROM ESUSER.PROCESS_ASSIGNMENT
                              WHERE USER_ID = ?`;

      db2.open(secp, (err, conn) => {
        if (!err) {
          console.log("Connected Successfully");
        } else {
          console.log(
            "Error occurred while connecting to the database" + err.message
          );
        }

        conn.query(deletePrevData, [userId.toUpperCase()], (err, results) => {
          if (err) {
            console.log(
              "Error occurred while deleting the previous EServices Management roles" +
                err.message
            );
          }
        });

        const insertNewData = `INSERT INTO ESUSER.PROCESS_ASSIGNMENT(ROLE_ID, USER_ID, ALPHABET_ASSIGNMENT, APPLICATION_NAME)
                               VALUES (?, ?, ?, ?)`;

        for (let i = 0; i < userRoles.length; i++) {
          conn.query(
            insertNewData,
            [
              userRoles[i].roleId,
              userId.toUpperCase(),
              null,
              userRoles[i].applicationName,
            ],
            (err, output) => {
              if (!err) {
                i === userRoles.length - 1 && res.send("Success");
              } else {
                console.log(
                  "Error occurred while updating the EServices Management roles" +
                    err.message
                );
              }
            }
          );
        }

        conn.close((err) => {
          if (!err) {
            console.log("Connection closed with the database");
          } else {
            console.log(
              "Error occurred while trying to close the connection with the database" +
                err.message
            );
          }
        });
      });
    } else {
      res.json("Authorization Failed. Token Expired. Please Login Again.");
    }
  });
});

router.get("/get-profile", (req, res) => {
  const token = req.get("key");

  if (!token) {
    res.json("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function (err, decoded) {
    if (!err) {
      const key = req.query.id;

      const fetch = `SELECT "name",
                            "email",
                            "userdesignation",
                            "userstatus",
                            "activedirectoryaccount",
                            "employeeid",
                            "location",
                            "department",
                            "samaccount"
                     FROM USER_CREDENTIALS
                     WHERE "email" = ?`;

      db2.open(secp, (err, conn) => {
        if (!err) {
          console.log("Connected Successfully");
        } else {
          console.log(
            "Error occurred while connecting to the database" + err.message
          );
        }

        conn.query(fetch, [key], (err, results) => {
          if (!err) {
            res.send(results);
          } else {
            console.log(
              "Error occurred while fetching the user profile data" +
                err.message
            );
          }

          conn.close((err) => {
            if (!err) {
              console.log("Connection closed with the database");
            } else {
              console.log(
                "Error occurred while trying to close the connection with the database" +
                  err.message
              );
            }
          });
        });
      });
    } else {
      res.json("Authorization Failed. Token Expired. Please Login Again.");
    }
  });
});

router.get("/get-log-requests", (req, res) => {
  const token = req.get("key");

  if (!token) {
    res.send("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function (err, decoded) {
    if (!err) {
      const fetch = `SELECT *
                     FROM ESUSER.REQUESTS_LOG`;

      db2.open(secp, (err, conn) => {
        if (!err) {
          console.log("Connected Successfully");
        } else {
          console.log(
            "Error occurred while connecting to the database" + err.message
          );
        }

        conn.query(fetch, (err, results) => {
          if (!err) {
            res.send(results);
          } else {
            console.log(
              "Error occurred while fetching the log requests" + err.message
            );
          }

          conn.close((err) => {
            if (!err) {
              console.log("Connection closed with the database");
            } else {
              console.log(
                "Error occurred while trying to close the connection with the database" +
                  err.message
              );
            }
          });
        });
      });
    } else {
      res.json("Authorization Failed. Token Expired. Please Login Again.");
    }
  });
});

router.post("/post-log-requests", (req, res) => {
  const token = req.get("key");

  if (!token) {
    res.send("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function (err, decoded) {
    if (!err) {
      const id1 = req.body.email;
      const id2 = req.body.message;

      const fetch = `INSERT INTO ESUSER.REQUESTS_LOG("USEREMAIL", "USERMESSAGE")
                     VALUES (?, ?)`;

      db2.open(secp, (err, conn) => {
        if (!err) {
          console.log("Connected Successfully");
        } else {
          console.log(
            "Error occurred while connecting to the database" + err.message
          );
        }

        conn.query(fetch, [id1, id2], (err, results) => {
          if (!err) {
            res.send("Data inserted successfully");
          } else {
            console.log(
              "Error occurred while inserting the data in log requests" +
                err.message
            );
          }

          conn.close((err) => {
            if (!err) {
              console.log("Connection closed with the database");
            } else {
              console.log(
                "Error occurred while trying to close the connection with the database" +
                  err.message
              );
            }
          });
        });
      });
    } else {
      res.json("Authorization Failed. Token Expired. Please Login Again.");
    }
  });
});

router.delete("/delete-log-requests", (req, res) => {
  const token = req.get("key");

  if (!token) {
    res.send("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function (err, decoded) {
    if (!err) {
      const id1 = req.query.email;
      const id2 = req.query.message;

      const fetch = `DELETE
                     FROM ESUSER.REQUESTS_LOG
                     WHERE "USEREMAIL" = ?
                       AND "USERMESSAGE" = ?`;

      db2.open(secp, (err, conn) => {
        if (!err) {
          console.log("Connected Successfully");
        } else {
          console.log(
            "Error occurred while connecting to the database" + err.message
          );
        }

        conn.query(fetch, [id1, id2], (err, results) => {
          if (!err) {
            response = {
              status: "ok",
            };
            res.send(response);
          } else {
            console.log(
              "Error occurred while deleting the data in log requests" +
                err.message
            );
          }

          conn.close((err) => {
            if (!err) {
              console.log("Connection closed with the database");
            } else {
              console.log(
                "Error occurred while trying to close the connection with the database" +
                  err.message
              );
            }
          });
        });
      });
    } else {
      res.json("Authorization Failed. Token Expired. Please Login Again.");
    }
  });
});

router.get("/combined-ctc-report", (req, res) => {
  const token = req.get("key");

  if (!token) {
    res.send("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function (err, decoded) {
    const startDate = req.query.id;
    const endDate = req.query.id2;

    const ctcReport = [];
    if (!err) {
      const digitalCtc = `select (COALESCE(b.ApplyDate, a.ApplyDate)) as date,
      MONTHNAME(date(b.ApplyDate)) Invoice_Month,
      COALESCE(DigitalTotalFiled,0) Dig_Issued,COALESCE(DigitalPaidAmount,0) Dig_Amt,
      COALESCE(StandTotalFiled,0) Stand_Issued,COALESCE(StandPaidAmount,0) as Stand_Amt
                          from (
                            SELECT DATE (USER.DT) as ApplyDate, SUM (BCF.FEEPD) as StandPaidAmount, Count (*) StandTotalFiled
                            FROM SECP.BANK_CHALLAN_FORM BCF INNER JOIN
                            (
                            SELECT UP.USER_PROCESS_ID, DATE (UP.END_DATE) AS DT from SECP.USER_PROCESSES UP WHERE UP.STATUS = 'Closed'
                            and DATE (UP.END_DATE) >= DATE ('${startDate}') AND DATE (UP.END_DATE) <= DATE ('${endDate}') and UP.PROCESS_ID = 17001
                            )
                            USER
                            ON BCF.USER_PROCESS_ID = USER.USER_PROCESS_ID
                            GROUP BY DATE (USER.DT)
                            ) a right outer join (
                            SELECT DATE (USER.DT) as ApplyDate, SUM (BCF.FEEPD) as DigitalPaidAmount, Count (*) as DigitalTotalFiled
                            FROM SECP.BANK_CHALLAN_FORM BCF INNER JOIN (
                            SELECT UP.USER_PROCESS_ID, DATE (UP.END_DATE) AS DT from SECP.USER_PROCESSES UP WHERE UP.STATUS = 'Closed'
                            and DATE (UP.END_DATE) >= DATE ('${startDate}') AND DATE (UP.END_DATE) <= DATE ('${endDate}') and UP.PROCESS_ID = 17003
                            )
                            USER
                            ON BCF.USER_PROCESS_ID = USER.USER_PROCESS_ID
                            GROUP BY USER.DT
                            ) b
                          on a.APPLYDATE = b.APPLYDATE
                          order by 1 asc
                            for fetch only
                          with UR`;

      const bankPortal = `select BL.ENTITY_NAME,
                                 monthname(date(BI.INVOICE_DATE)-1 month) Invoice_Month,
                                 BI.INVOICE_AMOUNT,
                                 BI.CHALLAN_NO,
                            date (BI.INVOICE_PERIOD_FROM) Invoice_Period_From, date (BI.INVOICE_PERIOD_TO) Invoice_Period_To, UP.USER_NAME, UP.USER_EMAIL, UP.USER_CELL
                          from ESUSER.BANK_INVOICE_SUMMARY BI, ESUSER.BANK_ENTITY_LOOKUP BL, ESUSER.USER_PROFILE_BANKS_OTHR_ENTITIES up
                          WHERE
                            BI.ENTITY_ID=BL.ENTITY_ID
                            AND BL.ENTITY_NAME=UP.NAME_OF_ENTITY
                            AND BL.ENTITY_NAME !='THE BANK'
                            AND UP.CREATED_BY in ('Hammad'
                              , 'Samreen'
                              , 'SECP')
                            AND date (BI.INVOICE_PERIOD_FROM) >= '${startDate}'
                            AND date (BI.INVOICE_PERIOD_TO) <= '${endDate}'
                          ORDER BY BI.CHALLAN_NO`;

      db2.open(secp_5, (err, conn) => {
        if (!err) {
          console.log("Connected Successfully");
        } else {
          console.log(
            "Error occurred while connecting to the database" + err.message
          );
        }

        conn.query(digitalCtc, (err, results) => {
          if (!err) {
            ctcReport.push(results);

            db2.open(secp_6, (err, conn) => {
              if (!err) {
                console.log("Connected Successfully");
              } else {
                console.log(
                  "Error occurred while connecting to the database" +
                    err.message
                );
              }

              conn.query(bankPortal, (err, results) => {
                if (!err) {
                  ctcReport.push(results);
                  res.send(ctcReport);
                } else {
                  console.log(
                    "Error occurred while querying bank portal" + err.message
                  );
                }
              });

              conn.close((err) => {
                if (!err) {
                  console.log("Connection closed with the database");
                } else {
                  console.log(
                    "Error occurred while trying to close the connection with the database" +
                      err.message
                  );
                }
              });
            });
          } else {
            console.log(
              "Error occurred while querying digital ctc" + err.message
            );
          }

          conn.close((err) => {
            if (!err) {
              console.log("Connection closed with the database");
            } else {
              console.log(
                "Error occurred while trying to close the connection with the database" +
                  err.message
              );
            }
          });
        });
      });
    } else {
      res.json("Authorization Failed. Token Expired. Please Login Again.");
    }
  });
});

router.post("/get-bank-usage-report", (req, res) => {
  const token = req.get("key");

  if (!token) {
    res.send("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function (err, decoded) {
    if (!err) {
      const { startDate, endDate } = req.body;

      const bankPortal = `select B.ENTITY_NAME, count(*) Total_Searches
                          from ESUSER.BANK_ENTITY_LOOKUP BE
                                 left outer join
                               ESUSER.BANK_COMPANY_LOG B
                               ON BE.ENTITY_NAME = B.ENTITY_NAME
                          where B.ENTITY_NAME !='The Bank' --AND B.COMPANY_TYPE='Public Limited Company'
      and DATE(B.VIEW_COMPANY_WHEN) BETWEEN DATE('${startDate}') and DATE('${endDate}')
                          group by b.ENTITY_NAME`;

      db2.open(secp_6, (err, conn) => {
        if (!err) {
          console.log("Connected Successfully");
        } else {
          console.log(
            "Error occurred while connecting to the database" + err.message
          );
        }

        conn.query(bankPortal, (err, results) => {
          if (!err) {
            res.send(results);
          } else {
            console.log(
              "Error occurred while deleting the data in log requests" +
                err.message
            );
          }

          conn.close((err) => {
            if (!err) {
              console.log("Connection closed with the database");
            } else {
              console.log(
                "Error occurred while trying to close the connection with the database" +
                  err.message
              );
            }
          });
        });
      });
    } else {
      res.json("Authorization Failed. Token Expired. Please Login Again.");
    }
  });
});

router.get("/get-data-sharing-report", (req, res) => {
  const token = req.get("key");

  if (!token) {
    res.send("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function (err, decoded) {
    if (!err) {
      queryResult = [];
      const dataSharingMonitorDB2 = `SELECT *
                                     FROM (SELECT MAX(EOBI_PUSHING_DATE) as "DATES", 'EOBI PUSH DATE' as "ENTITIES"
                                           FROM SECP.EOBI_DATA
                                           WHERE IS_POSTED_TO_EOBI = 1
                                             AND POSTING_STATUS = 1
                                           UNION ALL
                                           SELECT MAX(CREATED_WHEN), 'EOBI RECEIVE DATE'
                                           FROM SECP.API_CALL_LOG
                                           WHERE CALL_TYPE = 'EOBI'
                                           UNION ALL
                                           SELECT MAX(CREATED_WHEN), 'PITB PUSH DATE'
                                           FROM SECP.FBR_COMPANY_DATA_FOR_INTEGRATION
                                           WHERE IS_PITB_POSTED = 1
                                           UNION ALL
                                           SELECT MAX(CREATED_WHEN), 'PITB RECEIVE DATE'
                                           FROM SECP.PITB_REG_INFO
                                           UNION ALL
                                           SELECT MAX(CREATED_WHEN), 'FBR PUSH DATE'
                                           FROM SECP.FBR_COMPANY_DATA_FOR_INTEGRATION
                                           WHERE IS_FBR_POSTED = 1) FOR FETCH ONLY
                                     WITH UR`;

      const dataSharingMonitorOracle = `SELECT *
                                        FROM (SELECT MAX(TIMESTAMP) as "DATES", 'FBR RECEIVE DATE' as "ENTITIES"
                                              FROM WEBSERVICE.FBR_COMPANY_NTN
                                              WHERE INFO_TYPE = 'Company'
                                                AND COMPANY_NTN IS NOT NULL
                                              UNION ALL
                                              SELECT MAX(CREATED_WHEN), 'FMU DATE'
                                              FROM API_CALL_LOG LOGG
                                              WHERE USER_NAME = 'FMU'
                                              UNION ALL
                                              SELECT MAX(CREATED_WHEN), 'BOI DATE'
                                              FROM API_CALL_LOG LOGG
                                              WHERE USER_NAME = 'BOI'
                                              UNION ALL
                                              SELECT MAX(CREATED_WHEN), 'STR MORTGAGE DATE'
                                              FROM API_CALL_LOG LOGG
                                              WHERE USER_NAME = 'STR')`;

      db2.open(secp_5, (err, conn) => {
        if (!err) {
          console.log("Connected Successfully");
        } else {
          console.log(
            "Error occurred while connecting to the database" + err.message
          );
        }

        conn.query(dataSharingMonitorDB2, (err, results) => {
          if (!err) {
            queryResult.push(results);

            var connection = oracledb.getConnection(
              {
                user: oracleUser,
                password: oraclePassword,
                connectString: oracleConnectString,
              },
              (err, conn) => {
                if (!err) {
                  console.log("Connected to the database successfully");
                } else {
                  console.log(
                    "Error occurred while trying to connect to the database: " +
                      err.message
                  );
                }

                conn.execute(dataSharingMonitorOracle, (err, results) => {
                  if (!err) {
                    queryResult.push(results.rows);
                    res.send(queryResult);
                  } else {
                    console.log(
                      "Error occurred while searching the company record by number in Oracle " +
                        err.message
                    );
                  }

                  conn.release((err) => {
                    if (!err) {
                      console.log("Connection closed with the database");
                    } else {
                      console.log(
                        "Error occurred while closing the connection with the database " +
                          err.message
                      );
                    }
                  });
                });
              }
            );
          } else {
            console.log(
              "Error occurred while deleting the data in log requests" +
                err.message
            );
          }

          conn.close((err) => {
            if (!err) {
              console.log("Connection closed with the database");
            } else {
              console.log(
                "Error occurred while trying to close the connection with the database" +
                  err.message
              );
            }
          });
        });
      });
    } else {
      res.json("Authorization Failed. Token Expired. Please Login Again.");
    }
  });
});

router.put("/update-profile", (req, res) => {
  const token = req.get("key");

  if (!token) {
    res.send("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function (err, decoded) {
    if (!err) {
      const key = req.query.id;
      const key2 = req.query.id2;
      const key3 = req.query.id3;

      let updateData = `UPDATE USER_CREDENTIALS
                        SET "${key3}" = ?
                        WHERE "email" = ?`;

      if (key3 === "password") {
        updateData = `UPDATE USER_CREDENTIALS
                      SET "${key3}" = ENCRYPT('${key}', '${passwordKey}')
                      WHERE "email" = ?`;
      }

      db2.open(secp, (err, conn) => {
        if (!err) {
          console.log("Connected Successfully");
        } else {
          console.log(
            "Error occurred while connecting to the database" + err.message
          );
        }

        if (key3 === "password") {
          conn.query(updateData, [key2], (err, results) => {
            if (!err) {
              res.send("Data updated successfully");
            } else {
              console.log(
                "Error occurred while updating the user profile data" +
                  err.message
              );
            }

            conn.close((err) => {
              if (!err) {
                console.log("Connection closed with the database");
              } else {
                console.log(
                  "Error occurred while trying to close the connection with the database" +
                    err.message
                );
              }
            });
          });
        } else {
          conn.query(updateData, [key, key2], (err, results) => {
            if (!err) {
              res.send("Data updated successfully");
            } else {
              console.log(
                "Error occurred while updating the user profile data" +
                  err.message
              );
            }

            conn.close((err) => {
              if (!err) {
                console.log("Connection closed with the database");
              } else {
                console.log(
                  "Error occurred while trying to close the connection with the database" +
                    err.message
                );
              }
            });
          });
        }
      });
    } else {
      res.send("Authorization Failed. Token Expired. Please Login Again.");
    }
  });
});

var appRoutes = express();
var filenameUploaded;

appRoutes.use("/uploads", express.static(path.join(__dirname, "/uploads")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    filenameUploaded = req.query.id;
    if (file.mimetype === "image/jpeg") {
      cb(null, filenameUploaded + ".jpg");
    } else if (file.mimetype === "image/png") {
      cb(null, filenameUploaded + ".png");
    } else {
      console.log("Error occurred as the file type is incorrect");
    }
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
    console.log(req.ip + " User is trying to upload incorrect file type");
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 },
  fileFilter: fileFilter,
});

router.post("/update-image", upload.single("file"), (req, res, next) => {
  const token = req.get("key");

  if (!token) {
    res.send("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function (err, decoded) {
    if (!err) {
      try {
        return res.status(201).json({
          message: "Image Uploaded Successfully",
        });
      } catch (e) {
        console.log("Error occurred while uploading image" + e.message);
      }
    } else {
      res.send("Authorization Failed. Token Expired. Please Login Again.");
    }
  });
});

router.get("/get-profile-photo", (req, res) => {
  const token = req.get("key");

  if (!token) {
    res.send("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function (err, decoded) {
    if (!err) {
      const testFolder = "/uploads";
      var fileDetails = [];
      const key = req.query.id + ".jpg";
      const key2 = req.query.id + ".png";
      const options = {
        root: path.join(__dirname, testFolder),
        dotFiles: "deny",
        headers: {
          "x-timestamp": Date.now(),
          "x-sent": true,
        },
      };

      res.sendFile(key, options, function (err) {
        if (!err) {
          console.log("Image sent successfully");
        } else {
          res.sendFile(key2, options, function (err) {
            if (!err) {
              console.log("Image sent successfully");
            } else {
              const key3 = "demo.jpg";
              res.sendFile(key3, options, function (err) {
                if (!err) {
                  console.log("Image sent successfully");
                } else {
                  console.log(
                    "Error occurred while sending the image" + err.message
                  );
                }
              });
            }
          });
        }
      });
    } else {
      res.send("Authorization Failed. Token Expired. Please Login Again.");
    }
  });
});

router.get("/fetch-bank-data", (req, res) => {
  calculateIP(req.ip, "/fetch-bank-data");

  const token = req.get("key");

  if (!token) {
    res.json("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function (err, decoded) {
    if (!err) {
      const dataToSearch = `SELECT "ACTIVITY_LOG_ID",
                                   "USER_ID_FK",
                                   "USER_TYPE",
                                   "ENTITY_TYPE",
                                   "USER_NAME",
                                   "COMPANY_NAME",
                                   "VIEW_COMPANY_WHEN",
                                   "COMPANY_ID",
                                   "COMPANY_INC_NO",
                                   "ENTITY_NAME"
                            FROM BANK_COMPANY_LOG`;

      db2.open(secp, (err, conn) => {
        if (!err) {
          console.log("Connected Successfully");
        } else {
          console.log(
            "Error occurred while connecting to the database" + err.message
          );
        }

        conn.query(dataToSearch, (err, results) => {
          if (!err) {
            res.send(results);
          } else {
            console.log(
              "Error occurred while fetching bank company log data" +
                err.message
            );
          }

          conn.close((err) => {
            if (!err) {
              console.log("Connection closed with the database");
            } else {
              console.log(
                "Error occurred while trying to close the connection with the database" +
                  err.message
              );
            }
          });
        });
      });
    } else {
      res.json("Authorization Failed. Token Expired. Please Login Again.");
    }
  });
});

router.get("/search-bank-data-entity", (req, res) => {
  calculateIP(req.ip, "/search-bank-data-entity");

  const token = req.get("key");

  if (!token) {
    res.json("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function (err, decoded) {
    if (!err) {
      const key = req.query.id.toUpperCase();

      const dataToSearch = `SELECT "ACTIVITY_LOG_ID",
                                   "USER_ID_FK",
                                   "USER_TYPE",
                                   "ENTITY_TYPE",
                                   "USER_NAME",
                                   "COMPANY_NAME",
                                   "VIEW_COMPANY_WHEN",
                                   "COMPANY_ID",
                                   "COMPANY_INC_NO",
                                   "ENTITY_NAME"
                            FROM BANK_COMPANY_LOG
                            WHERE UPPER("ENTITY_NAME") LIKE '%${key}%'
                               OR UPPER("VIEW_COMPANY_WHEN") LIKE '%${key}%'`;

      db2.open(secp, (err, conn) => {
        if (!err) {
          console.log("Connected Successfully");
        } else {
          console.log(
            "Error occurred while connecting to the database" + err.message
          );
        }

        conn.query(dataToSearch, (err, results) => {
          if (!err) {
            res.send(results);
          } else {
            console.log(
              "Error occurred while searching bank company log data by entity name" +
                err.message
            );
          }

          conn.close((err) => {
            if (!err) {
              console.log("Connection closed with the database");
            } else {
              console.log(
                "Error occurred while trying to close the connection with the database" +
                  err.message
              );
            }
          });
        });
      });
    } else {
      res.json("Authorization Failed. Token Expired. Please Login Again.");
    }
  });
});

router.get("/search-bank-data-date", (req, res) => {
  calculateIP(req.ip, "/search-bank-data-date");

  const token = req.get("key");

  if (!token) {
    res.json("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function (err, decoded) {
    if (!err) {
      const startDate = req.query.id;
      const endDate = req.query.id2;

      const dataToSearch = `SELECT "ACTIVITY_LOG_ID",
                                   "USER_ID_FK",
                                   "USER_TYPE",
                                   "ENTITY_TYPE",
                                   "USER_NAME",
                                   "COMPANY_NAME",
                                   "VIEW_COMPANY_WHEN",
                                   "COMPANY_ID",
                                   "COMPANY_INC_NO",
                                   "ENTITY_NAME"
                            FROM BANK_COMPANY_LOG
                            WHERE "VIEW_COMPANY_WHEN" >= '${startDate}'
                              AND "VIEW_COMPANY_WHEN" <= '${endDate}'`;

      db2.open(secp, (err, conn) => {
        if (!err) {
          console.log("Connected Successfully");
        } else {
          console.log(
            "Error occurred while connecting to the database" + err.message
          );
        }

        conn.query(dataToSearch, (err, results) => {
          if (!err) {
            res.send(results);
          } else {
            console.log(
              "Error occurred while searching bank company log data by date" +
                err.message
            );
          }

          conn.close((err) => {
            if (!err) {
              console.log("Connection closed with the database");
            } else {
              console.log(
                "Error occurred while trying to close the connection with the database" +
                  err.message
              );
            }
          });
        });
      });
    } else {
      res.json("Authorization Failed. Token Expired. Please Login Again.");
    }
  });
});

router.get("/ctc-table-summary", (req, res) => {
  calculateIP(req.ip, "/ctc-table-summary");

  const token = req.get("key");

  if (!token) {
    res.json("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function (err, decoded) {
    if (!err) {
      const fetchTableSummary = `Select COUNT("SIGNATORY_NIC1") AS Total, "STATUS", SUM("CHALLAN_AMMOUNT") as Amount
                                 FROM SECP.DIGITAL_CERTIFIED_COPY_FORM DCTC
                                        left outer join SECP.USER_PROCESSES UP on DCTC."USER_PROCESS_ID" = UP."USER_PROCESS_ID"
                                 WHERE "STATUS" not in ('Rejected')
                                 GROUP BY "STATUS"`;

      db2.open(secp_2, (err, conn) => {
        if (!err) {
          console.log("Connected Successfully");
        } else {
          console.log(
            "Error occurred while connecting to the database" + err.message
          );
        }

        conn.query(fetchTableSummary, (err, results) => {
          if (!err) {
            res.send(results);
          } else {
            console.log(
              "Error occurred while fetching ctc table summary" + err.message
            );
          }

          conn.close((err) => {
            if (!err) {
              console.log("Connection closed with the database");
            } else {
              console.log(
                "Error occurred while trying to close the connection with the database" +
                  err.message
              );
            }
          });
        });
      });
    } else {
      res.json("Authorization Failed. Token Expired. Please Login Again.");
    }
  });
});

router.get("/fetch-ctc-table", (req, res) => {
  calculateIP(req.ip, "/fetch-ctc-table");

  const token = req.get("key");

  if (!token) {
    res.json("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function (err, decoded) {
    if (!err) {
      // const fetchProcessList = `SELECT DCTC."CMPNYNAME", DCTC."CMPNY_NIC_NUM", DCTC."FORM_SUB_DATE", DCTC."USER_PROCESS_ID", DCTC."SIGNATORY_NAME", DCTC."SIGNATORY_NIC1", DCTC."MODE_OF_PAYMENT", DCTC."CHALLAN_AMMOUNT", DCTC."EMAIL_ADDRESS", UP."STATUS" FROM SECP.DIGITAL_CERTIFIED_COPY_FORM DCTC, SECP.USER_PROCESSES UP WHERE DCTC."USER_PROCESS_ID" = UP."USER_PROCESS_ID" AND UP."PROCESS_ID" = '17003'`;

      const fetchProcessList = `SELECT DCTC."CMPNYNAME",
                                       DCTC."CMPNY_NIC_NUM",
                                       DCTC."FORM_SUB_DATE",
                                       DCTC."USER_PROCESS_ID",
                                       DCTC."SIGNATORY_NAME",
                                       DCTC."SIGNATORY_NIC1",
                                       DCTC."MODE_OF_PAYMENT",
                                       DCTC."CHALLAN_AMMOUNT",
                                       DCTC."EMAIL_ADDRESS",
                                       UP."STATUS"
                                FROM SECP.DIGITAL_CERTIFIED_COPY_FORM DCTC
                                       LEFT OUTER JOIN SECP.USER_PROCESSES UP ON DCTC.USER_PROCESS_ID = UP.USER_PROCESS_ID`;

      db2.open(secp_2, (err, conn) => {
        if (!err) {
          console.log("Connected Successfully");
        } else {
          console.log(
            "Error occurred while connecting to the database" + err.message
          );
        }

        conn.query(fetchProcessList, (err, results) => {
          if (!err) {
            res.send(results);
          } else {
            console.log(
              "Error occurred while fetching ctc table list" + err.message
            );
          }

          conn.close((err) => {
            if (!err) {
              console.log("Connection closed with the database");
            } else {
              console.log(
                "Error occurred while trying to close the connection with the database" +
                  err.message
              );
            }
          });
        });
      });
    } else {
      res.json("Authorization Failed. Token Expired. Please Login Again.");
    }
  });
});

router.get("/search-ctc-table", (req, res) => {
  calculateIP(req.ip, "/search-ctc-table");

  const token = req.get("key");

  if (!token) {
    res.json("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function (err, decoded) {
    if (!err) {
      const searchElement = req.query.id.toUpperCase();

      const searchDB = `SELECT DCTC."CMPNYNAME",
                               DCTC."CMPNY_NIC_NUM",
                               DCTC."FORM_SUB_DATE",
                               DCTC."USER_PROCESS_ID",
                               DCTC."SIGNATORY_NAME",
                               DCTC."SIGNATORY_NIC1",
                               DCTC."MODE_OF_PAYMENT",
                               DCTC."CHALLAN_AMMOUNT",
                               DCTC."EMAIL_ADDRESS",
                               UP."STATUS"
                        FROM SECP.DIGITAL_CERTIFIED_COPY_FORM DCTC
                               LEFT OUTER JOIN SECP.USER_PROCESSES UP ON DCTC."USER_PROCESS_ID" = UP."USER_PROCESS_ID"
                        WHERE (UPPER(DCTC."CMPNYNAME") LIKE '%${searchElement}%' OR UPPER(DCTC."CMPNY_NIC_NUM")
                          LIKE '%${searchElement}%' OR UPPER(DCTC."FORM_SUB_DATE") LIKE '%${searchElement}%' OR
                               UPPER(DCTC."USER_PROCESS_ID")
                                 LIKE '%${searchElement}%' OR UPPER(DCTC."SIGNATORY_NAME") LIKE '%${searchElement}%' OR
                               UPPER(DCTC."SIGNATORY_NIC1")
                                 LIKE '%${searchElement}%' OR UPPER(DCTC."MODE_OF_PAYMENT") LIKE '%${searchElement}%' OR
                               UPPER(DCTC."CHALLAN_AMMOUNT")
                                 LIKE '%${searchElement}%' OR UPPER(DCTC."EMAIL_ADDRESS") LIKE '%${searchElement}%' OR
                               UPPER(UP."STATUS") LIKE
                               '%${searchElement}%')`;

      db2.open(secp_2, (err, conn) => {
        if (!err) {
          console.log("Connected Successfully");
        } else {
          console.log(
            "Error occurred while connecting to the database" + err.message
          );
        }

        conn.query(searchDB, (err, results) => {
          if (!err) {
            res.send(results);
          } else {
            console.log(
              "Error occurred while searching ctc table list" + err.message
            );
          }

          conn.close((err) => {
            if (!err) {
              console.log("Connection closed with the database");
            } else {
              console.log(
                "Error occurred while trying to close the connection with the database" +
                  err.message
              );
            }
          });
        });
      });
    } else {
      res.json("Authorization Failed. Token Expired. Please Login Again.");
    }
  });
});

router.get("/fetch-applied-ctc-table", (req, res) => {
  calculateIP(req.ip, "/fetch-applied-ctc-table");

  const token = req.get("key");

  if (!token) {
    res.json("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function (err, decoded) {
    if (!err) {
      const searchDB = `SELECT "FORM_NAME", "FORM_FEE", to_char(to_date("DATE",'dd/mm/yyyy'), 'Dd-Mon-yyyy') as "DATE", "USER_ID"
                        FROM SECP.DIGITAL_CERTIFIED_COPY_FORM_INFO DCTC
                               LEFT OUTER JOIN
                             SECP.USER_PROCESSES UP ON DCTC."USER_PROCESS_ID" = UP."USER_PROCESS_ID"`;

      db2.open(secp_2, (err, conn) => {
        if (!err) {
          console.log("Connected Successfully");
        } else {
          console.log(
            "Error occurred while connecting to the database" + err.message
          );
        }

        conn.query(searchDB, (err, results) => {
          if (!err) {
            res.send(results);
          } else {
            console.log(
              "Error occurred while searching ctc applied table list" +
                err.message
            );
          }

          conn.close((err) => {
            if (!err) {
              console.log("Connection closed with the database");
            } else {
              console.log(
                "Error occurred while trying to close the connection with the database" +
                  err.message
              );
            }
          });
        });
      });
    } else {
      res.json("Authorization Failed. Token Expired. Please Login Again.");
    }
  });
});

router.get("/error-proceeds", (req, res) => {
  calculateIP(req.ip, "/error-proceeds");

  const token = req.get("key");

  if (!token) {
    res.json("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function (err, decoded) {
    if (!err) {
      const searchDB = `SELECT PROCESS, NAME, RECEIVED, LAST_MODIFIED
                        FROM FMC.WORK_ITEM
                        WHERE "OWNER" = 'ADMIN'
                          AND "STATE" = 128 for fetch only
                        with ur`;

      db2.open(secp_3, (err, conn) => {
        if (!err) {
          console.log("Connected Successfully");
        } else {
          console.log(
            "Error occurred while connecting to the database" + err.message
          );
        }

        conn.query(searchDB, (err, results) => {
          if (!err) {
            res.send(results);
          } else {
            console.log(
              "Error occurred while fetching error proceeds data " + err.message
            );
          }

          conn.close((err) => {
            if (!err) {
              console.log("Connection closed with the database");
            } else {
              console.log(
                "Error occurred while trying to close the connection with the database" +
                  err.message
              );
            }
          });
        });
      });
    } else {
      res.json("Authorization Failed. Token Expired. Please Login Again.");
    }
  });
});

router.get("/error-processes", (req, res) => {
  calculateIP(req.ip, "/error-processes");

  const token = req.get("key");

  if (!token) {
    res.json("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function (err, decoded) {
    if (!err) {
      const searchDB = `SELECT PROCESS, NAME, RECEIVED, LAST_MODIFIED
                        FROM FMC.WORK_ITEM
                        WHERE PROCESS LIKE '%=%' for fetch only
                        with ur`;

      db2.open(secp_3, (err, conn) => {
        if (!err) {
          console.log("Connected Successfully");
        } else {
          console.log(
            "Error occurred while connecting to the database" + err.message
          );
        }

        conn.query(searchDB, (err, results) => {
          if (!err) {
            res.send(results);
          } else {
            console.log(
              "Error occurred while fetching error processes data " +
                err.message
            );
          }

          conn.close((err) => {
            if (!err) {
              console.log("Connection closed with the database");
            } else {
              console.log(
                "Error occurred while trying to close the connection with the database" +
                  err.message
              );
            }
          });
        });
      });
    } else {
      res.json("Authorization Failed. Token Expired. Please Login Again.");
    }
  });
});

router.get("/fetch-data-by-name-in-eservices", (req, res) => {
  calculateIP(req.ip, "/fetch-data-by-name-in-eservices");

  const token = req.get("key");

  if (!token) {
    res.json("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function (err, decoded) {
    if (!err) {
      const companyName = req.query.id.toUpperCase();
      var documentStatus;
      var sortBy;
      var processName;
      var startDate;
      var endDate;

      if (req.query.id2 !== "Select Document Status") {
        documentStatus = req.query.id2;
      } else {
        documentStatus = "";
      }

      if (req.query.id3 !== "Sort by") {
        sortBy = req.query.id3;
        if (sortBy === "Start Date") {
          sortBy = "ASC";
        } else {
          sortBy = "DESC";
        }
      } else {
        sortBy = "DESC";
      }

      if (req.query.id4 !== "Select Process Name") {
        processName = req.query.id4;
      } else {
        processName = "";
      }

      if (req.query.id5 !== "start date") {
        startDate = req.query.id5;
      } else {
        startDate = "12/31/1995";
      }

      if (req.query.id6 !== "end date") {
        endDate = req.query.id6;
      } else {
        endDate = "12/31/2025";
      }

      const searchDB = `SELECT A.*, ICM."CMPNYINCNO", ICM."CMPNYNAME"
                        FROM (SELECT PROCESS_DEF."PROCESS_ID",
                                     COALESCE(PROCESS_DEF."PROCESS_NAME", '')
                                       || '  ( ' || SUBSTR(CHAR(USER_PROCESSES."USER_PROCESS_ID"),9, 7) || ' )' ||
                                     USER_PROCESSES."STATUS"        AS PROCESS_NAME,
                                     USER_PROCESS_DOCS."CM_DOC_PID" AS DOCUMENT_NAME,
                                     DOCUMENT_DEF.DESCRIPTION       AS DOCUMENT_DESC,
                                     USER_PROCESSES."COMP_PID",
                                     USER_PROCESS_DOCS."DATE_SUBMITTED",
                                     USER_PROCESSES."STATUS",
                                     USER_PROCESSES."USER_PROCESS_ID",
                                     "CM_DOC_PID",
                                     USER_PROCESSES."PROCESS_FLDR_ID",
                                     "START_DATE",
                                     "END_DATE"
                              FROM PROCESS_DEF
                                     INNER JOIN USER_PROCESS_DOCS on
                                PROCESS_DEF."PROCESS_ID" = USER_PROCESS_DOCS."PROCESS_ID"
                                     INNER JOIN USER_PROCESSES
                                                on USER_PROCESS_DOCS."USER_PROCESS_ID" = USER_PROCESSES."USER_PROCESS_ID"
                                     INNER JOIN DOCUMENT_DEF
                                                on USER_PROCESS_DOCS."DOCUMENT_ID" = DOCUMENT_DEF."DOCUMENT_ID") A
                               INNER JOIN ICM_COMPANY ICM on
                          A."COMP_PID" = ICM."CMPNYID"
                        WHERE "CMPNYNAME" LIKE '%${companyName}%'
                          AND A."STATUS" LIKE '%${documentStatus}%'
                          AND A."PROCESS_NAME" LIKE '%${processName}%'
                          AND A."START_DATE" >= '${startDate}'
                          AND A."END_DATE" <= '${endDate}'
                        ORDER BY A."USER_PROCESS_ID" ${sortBy},
        A."DATE_SUBMITTED" ${sortBy}
                          FOR FETCH ONLY
                        WITH UR `;

      db2.open(secp_2, (err, conn) => {
        if (!err) {
          console.log("Connected Successfully");
        } else {
          console.log(
            "Error occurred while connecting to the database" + err.message
          );
        }

        conn.query(searchDB, (err, results) => {
          if (!err) {
            res.send(results);
          } else {
            console.log(
              "Error occurred while searching for company records " +
                err.message
            );
          }

          conn.close((err) => {
            if (!err) {
              console.log("Connection closed with the database");
            } else {
              console.log(
                "Error occurred while trying to close the connection with the database" +
                  err.message
              );
            }
          });
        });
      });
    } else {
      res.json("Authorization Failed. Token Expired. Please Login Again.");
    }
  });
});

router.get("/fetch-data-by-number-in-eservices", (req, res) => {
  calculateIP(req.ip, "/fetch-data-by-number-in-eservices");

  const token = req.get("key");

  if (!token) {
    res.json("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function (err, decoded) {
    if (!err) {
      const companyNumber = req.query.id;
      var documentStatus = req.query.id2;
      var sortBy = req.query.id3;
      var processName = req.query.id4;
      var startDate = req.query.id5;
      var endDate = req.query.id6;

      if (req.query.id2 !== "Select Document Status") {
        documentStatus = req.query.id2;
      } else {
        documentStatus = "";
      }

      if (req.query.id3 !== "Sort by") {
        sortBy = req.query.id3;
        if (sortBy === "Start Date") {
          sortBy = "ASC";
        } else {
          sortBy = "DESC";
        }
      } else {
        sortBy = "DESC";
      }

      if (req.query.id4 !== "Select Process Name") {
        processName = req.query.id4;
      } else {
        processName = "";
      }

      if (req.query.id5 !== "start date") {
        startDate = req.query.id5;
      } else {
        startDate = "12/31/1995";
      }

      if (req.query.id6 !== "end date") {
        endDate = req.query.id6;
      } else {
        endDate = "12/31/2025";
      }

      const searchDB = `SELECT A.*, ICM."CMPNYINCNO", ICM."CMPNYNAME"
                        FROM (SELECT PROCESS_DEF."PROCESS_ID",
                                     COALESCE(PROCESS_DEF."PROCESS_NAME", '')
                                       || '  ( ' || SUBSTR(CHAR(USER_PROCESSES."USER_PROCESS_ID"),9, 7) || ' )' ||
                                     USER_PROCESSES."STATUS"        AS PROCESS_NAME,
                                     USER_PROCESS_DOCS."CM_DOC_PID" AS DOCUMENT_NAME,
                                     DOCUMENT_DEF.DESCRIPTION       AS DOCUMENT_DESC,
                                     USER_PROCESSES."COMP_PID",
                                     USER_PROCESS_DOCS."DATE_SUBMITTED",
                                     USER_PROCESSES."STATUS",
                                     USER_PROCESSES."USER_PROCESS_ID",
                                     "CM_DOC_PID",
                                     USER_PROCESSES."PROCESS_FLDR_ID",
                                     "START_DATE",
                                     "END_DATE"
                              FROM PROCESS_DEF
                                     INNER JOIN USER_PROCESS_DOCS on
                                PROCESS_DEF."PROCESS_ID" = USER_PROCESS_DOCS."PROCESS_ID"
                                     INNER JOIN USER_PROCESSES
                                                on USER_PROCESS_DOCS."USER_PROCESS_ID" = USER_PROCESSES."USER_PROCESS_ID"
                                     INNER JOIN DOCUMENT_DEF
                                                on USER_PROCESS_DOCS."DOCUMENT_ID" = DOCUMENT_DEF."DOCUMENT_ID") A
                               INNER JOIN ICM_COMPANY ICM on
                          A."COMP_PID" = ICM."CMPNYID"
                        WHERE "CMPNYINCNO" = '${companyNumber}'
                          AND A."STATUS" LIKE '%${documentStatus}%'
                          AND A."PROCESS_NAME" LIKE '%${processName}%'
                          AND A."START_DATE" >= '${startDate}'
                          AND A."END_DATE" <= '${endDate}'
                        ORDER BY A."USER_PROCESS_ID" ${sortBy},
        A."DATE_SUBMITTED" ${sortBy}
                          FOR FETCH ONLY
                        WITH UR `;

      db2.open(secp_2, (err, conn) => {
        if (!err) {
          console.log("Connected Successfully");
        } else {
          console.log(
            "Error occurred while connecting to the database" + err.message
          );
        }

        conn.query(searchDB, (err, results) => {
          if (!err) {
            res.send(results);
          } else {
            console.log(
              "Error occurred while searching for company records " +
                err.message
            );
          }

          conn.close((err) => {
            if (!err) {
              console.log("Connection closed with the database");
            } else {
              console.log(
                "Error occurred while trying to close the connection with the database" +
                  err.message
              );
            }
          });
        });
      });
    } else {
      res.json("Authorization Failed. Token Expired. Please Login Again.");
    }
  });
});

router.get("/fetch-data-by-name-in-archive", (req, res) => {
  calculateIP(req.ip, "/fetch-data-by-name-in-archive");

  const token = req.get("key");

  if (!token) {
    res.json("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function (err, decoded) {
    if (!err) {
      const companyName = req.query.id.toUpperCase();
      const archiveData = req.query.id2;

      const searchDB = `SELECT A."TARGETITEMID"   COMP_PID,
                               A."SOURCECOMPID"   CM_DOC_PID,
                               B."ITEMID"         DOCUMENT_NAME4,
                               D."CMPNYNAME"      CMPNYNAME,
                               D."REGISTRATIONNO" USER_PROCESS_ID,
                               B."FILEREFERENCENO",
                               B."CATEGORY"       PROCESS_FLDR_ID,
                               C."TARGETITEMID" AS
                                                  DOCUMENTID
                        FROM (SELECT * FROM ICMADMIN.ICMSTRI001001) A,
                             (SELECT * FROM ICMADMIN.${archiveData}001) B,
                             (SELECT * FROM ICMADMIN.ICMSTRI001001) C,
                             (SELECT *
                              FROM ICMADMIN.CmpnyArchiveFld001 Y
                              WHERE Y.CMPNYNAME
                                      LIKE '%${companyName}%') D
                        WHERE A.SOURCEITEMID = B.ITEMID
                          AND B.ITEMID = C.SOURCEITEMID
                          AND B.REGISTRATIONNO = D.REGISTRATIONNO FOR FETCH ONLY
                        WITH UR;`;

      db2.open(secp_4, (err, conn) => {
        if (!err) {
          console.log("Connected Successfully");
        } else {
          console.log(
            "Error occurred while connecting to the database" + err.message
          );
        }

        conn.query(searchDB, (err, results) => {
          if (!err) {
            res.send(results);
          } else {
            console.log(
              "Error occurred while searching for company records " +
                err.message
            );
          }

          conn.close((err) => {
            if (!err) {
              console.log("Connection closed with the database");
            } else {
              console.log(
                "Error occurred while trying to close the connection with the database" +
                  err.message
              );
            }
          });
        });
      });
    } else {
      res.json("Authorization Failed. Token Expired. Please Login Again.");
    }
  });
});

router.get("/fetch-data-by-number-in-archive", (req, res) => {
  calculateIP(req.ip, "/fetch-data-by-number-in-archive");

  const token = req.get("key");

  if (!token) {
    res.send("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function (err, decoded) {
    if (!err) {
      const companyNumber = req.query.id;
      const archiveData = req.query.id2;

      const searchDB = `SELECT A."TARGETITEMID"   COMP_PID,
                               A."SOURCECOMPID"   CM_DOC_PID,
                               B."ITEMID"         DOCUMENT_NAME4,
                               D."CMPNYNAME"      CMPNYNAME,
                               D."REGISTRATIONNO" USER_PROCESS_ID,
                               B."FILEREFERENCENO",
                               B."CATEGORY"       PROCESS_FLDR_ID,
                               C."TARGETITEMID" AS
                                                  DOCUMENTID
                        FROM (SELECT * FROM ICMADMIN.ICMSTRI001001) A,
                             (SELECT * FROM ICMADMIN.${archiveData}001) B,
                             (SELECT * FROM ICMADMIN.ICMSTRI001001) C,
                             (SELECT *
                              FROM ICMADMIN.CmpnyArchiveFld001 Y
                              WHERE Y.REGISTRATIONNO
                                      = '${companyNumber}') D
                        WHERE A.SOURCEITEMID = B.ITEMID
                          AND B.ITEMID = C.SOURCEITEMID
                          AND B.REGISTRATIONNO = D.REGISTRATIONNO FOR FETCH ONLY
                        WITH UR;`;

      db2.open(secp_4, (err, conn) => {
        if (!err) {
          console.log("Connected Successfully");
        } else {
          console.log(
            "Error occurred while connecting to the database" + err.message
          );
        }

        conn.query(searchDB, (err, results) => {
          if (!err) {
            res.send(results);
          } else {
            console.log(
              "Error occurred while searching for company records " +
                err.message
            );
          }

          conn.close((err) => {
            if (!err) {
              console.log("Connection closed with the database");
            } else {
              console.log(
                "Error occurred while trying to close the connection with the database" +
                  err.message
              );
            }
          });
        });
      });
    } else {
      res.json("Authorization Failed. Token Expired. Please Login Again.");
    }
  });
});

router.get("/search-company-by-no", (req, res) => {
  calculateIP(req.ip, "/search-company-by-no");

  const token = req.get("key");

  if (!token) {
    res.json("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function (err, decoded) {
    if (!err) {
      const userKey = JSON.parse(req.query.id);

      var connection = oracledb.getConnection(
        {
          user: oracleUser,
          password: oraclePassword,
          connectString: oracleConnectString,
        },
        (err, conn) => {
          if (!err) {
            console.log("Connected to the database successfully");
          } else {
            console.log(
              "Error occurred while trying to connect to the database: " +
                err.message
            );
          }

          // var fetchData = "select COMP.company_code, COMP.name, COMP.comp_sub_mode, 'CRO ' || COMP_CRO.DESCRIPTION  CRO  from cr_company_master COMP INNER JOIN  CR_CRO_SETUP COMP_CRO ON COMP.CRO_CODE = COMP_CRO.CRO_CODE  where posted in('P', 'C') or posted is null";

          // used by Hassan
          // var fetchData = `select COMP.company_code, COMP.name, COMP.comp_sub_mode, 'CRO ' || COMP_CRO.DESCRIPTION CRO
          //                  from cr_company_master COMP
          //                         INNER JOIN CR_CRO_SETUP COMP_CRO ON COMP.CRO_CODE = COMP_CRO.CRO_CODE
          //                  where COMP.company_code = ${userKey}`;

          // given by sir Mohsin
          var fetchData = `select COMP.company_code, COMP.name, COMP.comp_sub_mode, 'CRO ' || COMP_CRO.DESCRIPTION CRO, posted
                           from cr_company_master COMP
                                  INNER JOIN CR_CRO_SETUP COMP_CRO ON COMP.CRO_CODE = COMP_CRO.CRO_CODE 
                           where (COMP.posted = 'N' or COMP.posted= 'P' or COMP.posted is null) 
                           and COMP.company_code =${userKey}`;

          conn.execute(fetchData, (err, results) => {
            if (!err) {
              res.send(results);
            } else {
              console.log(
                "Error occurred while searching the company record by number in Oracle " +
                  err.message
              );
            }

            conn.release((err) => {
              if (!err) {
                console.log("Connection closed with the database");
              } else {
                console.log(
                  "Error occurred while closing the connection with the database " +
                    err.message
                );
              }
            });
          });
        }
      );
    } else {
      res.json("Authorization Failed. Token Expired. Please Login Again.");
    }
  });
});

router.get("/search-company-by-name", (req, res) => {
  calculateIP(req.ip, "/search-company-by-name");

  const token = req.get("key");

  if (!token) {
    res.json("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function (err, decoded) {
    if (!err) {
      let userKey = req.query.id.toUpperCase();

      var connection = oracledb.getConnection(
        {
          user: oracleUser,
          password: oraclePassword,
          connectString: oracleConnectString,
        },
        (err, conn) => {
          if (!err) {
            console.log("Connected to the database successfully");
          } else {
            console.log(
              "Error occurred while trying to connect to the database: " +
                err.message
            );
          }

          if (typeof userKey === "string") {
            userKey = userKey.replace(/'/g, "''");
          }

          // used by Hassan
          // var fetchData = `select COMP.company_code, COMP.name, COMP.comp_sub_mode, 'CRO ' || COMP_CRO.DESCRIPTION CRO
          //                  from cr_company_master COMP
          //                         INNER JOIN CR_CRO_SETUP COMP_CRO ON COMP.CRO_CODE = COMP_CRO.CRO_CODE
          //                  where UPPER(COMP.name) LIKE '${userKey}%' fetch first 250 rows only`;

          // given by sir Mohsin
          var fetchData = `select COMP.company_code, COMP.name, COMP.comp_sub_mode, 'CRO ' || COMP_CRO.DESCRIPTION CRO, posted
          from cr_company_master COMP
                INNER JOIN CR_CRO_SETUP COMP_CRO ON COMP.CRO_CODE = COMP_CRO.CRO_CODE 
          where (COMP.posted = 'N' or COMP.posted= 'P' or COMP.posted is null) 
          and UPPER(COMP.name) LIKE '${userKey}%' fetch first 250 rows only`;

          conn.execute(fetchData, (err, results) => {
            if (!err) {
              res.send(results);
            } else {
              console.log(
                "Error occurred while searching the company record by name in Oracle " +
                  err.message
              );
            }

            conn.release((err) => {
              if (!err) {
                console.log("Connection closed with the database");
              } else {
                console.log(
                  "Error occurred while closing the connection with the database " +
                    err.message
                );
              }
            });
          });
        }
      );
    } else {
      res.json("Authorization Failed. Token Expired. Please Login Again.");
    }
  });
});

router.get("/get-companies-list", (req, res) => {
  calculateIP(req.ip, "/get-companies-list");

  const token = req.get("key");

  if (!token) {
    res.json("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function (err, decoded) {
    if (!err) {
      var connection = oracledb.getConnection(
        {
          user: oracleUser,
          password: oraclePassword,
          connectString: oracleConnectString,
        },
        (err, conn) => {
          if (!err) {
            console.log("Connected to the database successfully");
          } else {
            console.log(
              "Error occurred while trying to connect to the database: " +
                err.message
            );
          }

          var fetchData = `select COMP.company_code, COMP.name, COMP.comp_sub_mode, 'CRO ' || COMP_CRO.DESCRIPTION CRO
                           from cr_company_master COMP
                                  INNER JOIN CR_CRO_SETUP COMP_CRO ON COMP.CRO_CODE = COMP_CRO.CRO_CODE`;

          conn.execute(fetchData, (err, results) => {
            if (!err) {
              res.send(results);
            } else {
              console.log(
                "Error occurred while fetcing the companies list in Oracle " +
                  err.message
              );
            }

            conn.release((err) => {
              if (!err) {
                console.log("Connection closed with the database");
              } else {
                console.log(
                  "Error occurred while closing the connection with the database " +
                    err.message
                );
              }
            });
          });
        }
      );
    } else {
      res.json("Authorization Failed. Token Expired. Please Login Again.");
    }
  });
});

router.post("/export-to-excel", (req, res) => {
  calculateIP(req.ip, "/export-to-excel");

  const token = req.get("key");

  if (!token) {
    res.json("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function (err, decoded) {
    if (!err) {
      const exportData = req.body.value;
      const file = req.body.fileName;

      if (file === "BankReport") {
        fastCsv
          .write(exportData, { headers: true })
          .on("finish", function () {
            res.send("Written to Excel Successfully");
          })
          .pipe(ws2);
      } else if (file === "CtcComparisonReport") {
        fastCsv
          .write(exportData, { headers: true })
          .on("finish", function () {
            res.send("Written to Excel Successfully");
          })
          .pipe(ws3);
      } else if (file === "AppliedCtcReport") {
        fastCsv
          .write(exportData, { headers: true })
          .on("finish", function () {
            res.send("Written to Excel Successfully");
          })
          .pipe(ws4);
      } else if (file === "CtcFilingStatusReport") {
        fastCsv
          .write(exportData, { headers: true })
          .on("finish", function () {
            res.send("Written to Excel Successfully");
          })
          .pipe(ws5);
      } else if (file === "Banktransactionlog") {
        fastCsv
          .write(exportData, { headers: true })
          .on("finish", function () {
            res.send("Written to Excel Successfully");
          })
          .pipe(ws6);
      } else {
        fastCsv
          .write(exportData, { headers: true })
          .on("finish", function () {
            res.send("Written to Excel Successfully");
          })
          .pipe(ws);
      }
    } else {
      res.json("Authorization Failed. Token Expired. Please Login Again.");
    }
  });
});

router.get("/download-excel-file", (req, res) => {
  let options = {
    root: path.join(__dirname),
    dotfiles: "deny",
    headers: {
      "x-timestamp": Date.now(),
      "x-sent": true,
    },
  };

  let fileName = req.query.id;
  res.sendFile(fileName, options, function (err) {
    if (!err) {
      console.log("File sent successfully");
    } else {
      console.log("Error occurred while sending file: " + err.message);
    }
  });
});

appRoutes.use(
  "/iosco_alerts",
  express.static(path.join(__dirname, "/iosco_alerts"))
);

var ioscoAlertFile;
const storageAlert = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "iosco_alerts");
  },
  filename: (req, file, cb) => {
    ioscoAlertFile = file.originalname;
    if (
      file.mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      cb(null, ioscoAlertFile);
    } else {
      console.log("Error occurred as the file type is incorrect");
    }
  },
});

const fileFilterAlert = (req, file, cb) => {
  if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
    console.log(req.ip + " User is trying to upload incorrect file type");
  }
};

const uploadAlert = multer({
  storage: storageAlert,
  limits: { fileSize: 5000000 },
  fileFilter: fileFilterAlert,
});

let responseData;
let fileRecords;
let fileData = [];

router.post(
  "/upload-iosco-alerts",
  uploadAlert.single("sheetUpload"),
  async (req, res) => {
    calculateIP(req.ip, "/upload-iosco-alerts");

    const token = req.get("key");
    if (!token) {
      res.json("No Token Provided");
      return;
    }

    const isFileNameValid = await validateIOSCOFileName(req.file.filename);

    if (isFileNameValid === false) {
      responseData = {
        statusCode: 406,
        message: "Invalid File Name. File Name already exists.",
        error: true,
      };

      res.send(responseData);
      return;
    }

    const filePath = path.join(__dirname, `/iosco_alerts/${req.file.filename}`);

    const isFileValid = await validateIOSCOFile(filePath);

    if (!isFileValid) {
      responseData = {
        statusCode: 406,
        message: "Invalid File Template.",
        error: true,
      };

      fs.unlink(filePath, (err) => {
        if (!err) {
          console.log("file deleted");
        } else {
          console.log(
            "There is an incorrect file in the directory. Delete it manually due to some error"
          );
        }
      });
      res.send(responseData);
      return;
    }

    jwt.verify(token, secret, async function (err, decoded) {
      if (!err) {
        await readIOSCOFile(filePath, req.file.filename).then(() => {
          const { sheetType, sheetDescription, uploadedBy } = req.body;

          const uploadFile = `INSERT INTO SECP.ALERT_TYPE(ALERT_NAME, ALERT_TYPE, UPLOADED_BY, DESCRIPTION, 
                              TOTAL_RECORDS, UPLOADED_FILE) VALUES (?, ?, ?, ?, ?, ?)`;

          db2.open(secp_2, (err, conn) => {
            if (!err) {
              console.log("Connected Successfully");
            } else {
              console.log(
                "Error occurred while connecting to the database" + err.message
              );
            }

            var fileToUpload = {
              ParamType: "FILE",
              SQLType: "BLOB",
              Data: filePath,
            };

            conn.querySync(
              uploadFile,
              [
                req.file.filename,
                sheetType,
                uploadedBy,
                sheetDescription,
                fileRecords,
                fileToUpload,
              ],
              (err, results) => {
                if (!err) {
                  console.log(results);
                } else {
                  console.log(
                    "Error occurred while uploading iosco alerts" + err.message
                  );
                }

                conn.close((err) => {
                  if (!err) {
                    console.log("Connection closed with the database");
                  } else {
                    console.log(
                      "Error occurred while trying to close the connection with the database" +
                        err.message
                    );
                  }
                });
              }
            );
          });
        });
      } else {
        res.json("Authorization Failed. Token Expired. Please Login Again.");
      }
    });

    responseData = {
      statusCode: 200,
      message: "File added successfully.",
      error: false,
    };

    res.send(responseData);
  }
);

const validateIOSCOFileName = async (fileName) => {
  return new Promise((resolve) => {
    db2.open(secp_2, (err, conn) => {
      if (!err) {
        console.log("Connected Successfully");
      } else {
        console.log(
          "Error occurred while connecting to the database" + err.message
        );
      }

      const validateFile = `SELECT ALERT_NAME FROM SECP.ALERT_TYPE WHERE ALERT_NAME = ?`;

      conn.query(validateFile, [fileName], (err, results) => {
        if (!err) {
          results.length === 0 ? resolve(true) : resolve(false);
        } else {
          console.log(
            "Error occurred while inserting iosco alerts data" + err.message
          );
        }

        conn.close((err) => {
          if (!err) {
            console.log("Connection closed with the database");
          } else {
            console.log(
              "Error occurred while trying to close the connection with the database" +
                err.message
            );
          }
        });
      });
    });
  });
};

const validateIOSCOFile = async (filePath) => {
  return xlsxFile(filePath).then((rows) => {
    fileData = [...rows];
    fileRecords = rows.length - 1;
    if (
      rows[0][0].includes("Sr. #") &&
      rows[0][1].includes("Company") &&
      rows[0][2].includes("Link") &&
      rows[0][3].includes("Subject") &&
      rows[0][4].includes("Posted by")
    ) {
      return true;
    } else {
      return false;
    }
  });
};

const readIOSCOFile = async (filePath, fileName) => {
  xlsxFile(filePath).then((rows) => {
    db2.open(secp_2, (err, conn) => {
      if (!err) {
        console.log("Connected Successfully");
      } else {
        console.log(
          "Error occurred while connecting to the database" + err.message
        );
      }

      const insertFileData = `INSERT INTO SECP.ALERT_DATA(COMPANY_NAME, URL, SUBJECT, POSTED_BY, ALERT_NAME) 
                              VALUES (?, ?, ?, ?, ?)`;

      for (let i = 1; i < rows.length; i++) {
        conn.query(
          insertFileData,
          [rows[i][1], rows[i][2], rows[i][3], rows[i][4], fileName],
          (err, results) => {
            if (!err) {
              console.log("done");
            } else {
              console.log(
                "Error occurred while inserting iosco alerts data" + err.message
              );
            }
          }
        );
      }

      conn.close((err) => {
        if (!err) {
          console.log("Connection closed with the database");
        } else {
          console.log(
            "Error occurred while trying to close the connection with the database" +
              err.message
          );
        }
      });
    });
  });
};

router.get("/get-iosco-alerts", (req, res) => {
  const token = req.get("key");

  if (!token) {
    res.json("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function (err, decded) {
    if (!err) {
      const getAlerts = `SELECT ALERT_ID as "alertId", ALERT_NAME as "alertName", ALERT_TYPE as "alertType", 
                          UPLOADED_BY as "uploadedBy", TOTAL_RECORDS as "totalRecords" FROM ALERT_TYPE;`;

      db2.open(secp_2, (err, conn) => {
        if (!err) {
          console.log("Connected Successfully");
        } else {
          console.log(
            "Error occurred while connecting to the database" + err.message
          );
        }

        conn.query(getAlerts, (err, results) => {
          if (!err) {
            responseData = {
              data: results,
              statusCode: 200,
              message: "Success",
              error: false,
            };
            res.send(responseData);
          } else {
            console.log(
              "Error occurred while fetching iosco alerts" + err.message
            );
          }

          conn.close((err) => {
            if (!err) {
              console.log("Connection closed with the database");
            } else {
              console.log(
                "Error occurred while trying to close the connection with the database" +
                  err.message
              );
            }
          });
        });
      });
    } else {
      res.json("Authorization Failed. Token Expired. Please Login Again.");
    }
  });
});

router.get("/download-excel-template", (req, res) => {
  const token = req.get("key");

  if (!token) {
    res.json("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function (err, decoded) {
    const relativePath = "/iosco_alerts/sample_template";

    if (!err) {
      let options = {
        root: path.join(__dirname, relativePath),
        dotfiles: "deny",
        headers: {
          "x-timestamp": Date.now(),
          "x-sent": true,
        },
      };

      let fileName = "sample-template.xlsx";
      res.sendFile(fileName, options, function (err) {
        if (!err) {
          console.log("File sent successfully");
        } else {
          console.log("Error occurred while sending file: " + err.message);
        }
      });
    } else {
      res.json("Authorization Failed. Token Expired. Please Login Again.");
    }
  });
});

router.delete("/delete-iosco-alert", (req, res) => {
  const token = req.get("key");

  if (!token) {
    res.json("No Token Provided");
    return;
  }

  calculateIP(req.ip, "/delete-iosco-alert");

  jwt.verify(token, secret, function (err, decoded) {
    if (!err) {
      const id = req.query.id;

      const deleteSheet = `DELETE FROM SECP.ALERT_TYPE WHERE ALERT_NAME = ?`;
      const deleteSheetData = `DELETE FROM SECP.ALERT_DATA WHERE ALERT_NAME = ?`;

      db2.open(secp_2, (err, conn) => {
        if (!err) {
          console.log("Connected Successfully");
        } else {
          console.log(
            "Error occurred while connecting to the database" + err.message
          );
        }

        conn.query(deleteSheet, [id], (err, results) => {
          if (!err) {
            conn.query(deleteSheetData, [id], (err, results) => {
              if (!err) {
                responseData = {
                  statusCode: 200,
                  message: "Sheet has been deleted successfully",
                  error: false,
                };
                res.send(responseData);
              } else {
                console.log(
                  "Error occurred while fetching iosco alerts" + err.message
                );
              }
            });
          } else {
            console.log(
              "Error occurred while fetching iosco alerts" + err.message
            );
          }

          conn.close((err) => {
            if (!err) {
              console.log("Connection closed with the database");
            } else {
              console.log(
                "Error occurred while trying to close the connection with the database" +
                  err.message
              );
            }
          });
        });
      });
    } else {
      res.json("Authorization Failed. Token Expired. Please Login Again.");
    }
  });
});

router.get("/download-iosco-alert", (req, res) => {
  const token = req.get("key");

  if (!token) {
    res.json("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function (err, decoded) {
    const relativePath = "/iosco_alerts";

    if (!err) {
      let options = {
        root: path.join(__dirname, relativePath),
        dotfiles: "deny",
        headers: {
          "x-timestamp": Date.now(),
          "x-sent": true,
        },
      };

      res.sendFile(req.query.id, options, function (err) {
        if (!err) {
          console.log("File sent successfully");
        } else {
          console.log("Error occurred while sending file: " + err.message);
        }
      });
    } else {
      res.json("Authorization Failed. Token Expired. Please Login Again.");
    }
  });
});

router.get("/create-database", (req, res) => {
  var excelDataName = [];
  var excelDataEmail = [];
  var excelDataDesignation = [];
  var excelDataEmployee = [];
  var excelDataLocation = [];
  var excelDataDept = [];
  var excelDataSam = [];
  var excelDataUser = [];

  xlsxFile("AD_User_list.xlsx").then((rows) => {
    for (var x = 1; x < rows.length; x++) {
      excelDataName.push(rows[x][1]);
      excelDataEmail.push(rows[x][2]);
      excelDataDesignation.push(rows[x][4]);
      excelDataEmployee.push(rows[x][7]);
      excelDataLocation.push(rows[x][8]);
      excelDataDept.push(rows[x][9]);
      excelDataSam.push(rows[x][10]);
      excelDataUser.push(rows[x][11]);
    }
  });

  db2.open(secp, (err, conn) => {
    if (!err) {
      console.log("Connected to Database");
    } else {
      console.log(err.message);
    }
    console.log(passwordKey);
    for (var y = 0; y < excelDataName.length; y++) {
      const insertValues = `INSERT INTO ESUSER.USER_CREDENTIALS ("name", "email", "password", "userdesignation",
                                                                 "userstatus",
                                                                 "activedirectoryaccount", "employeeid", "location",
                                                                 "department", "samaccount", "userrights")
                            VALUES ('${excelDataName[y]}', '${excelDataEmail[y]}',
                                    ENCRYPT('Password123.', '${passwordKey}'), '${excelDataDesignation[y]}',
                                    'Active', 'Yes', '${excelDataEmployee[y]}', '${excelDataLocation[y]}',
                                    '${excelDataDept[y]}', '${excelDataSam[y]}', '${excelDataUser[y]}')`;
      conn.query(insertValues, (err, results) => {
        if (!err) {
          console.log(results);
        } else {
          console.log(err.message);
        }
      });
    }
  });
});

function calculateIP(ip, service) {
  const ipaddress = ip;

  const date = new Date();
  const dateToInsert =
    date.toISOString().split("T")[0] + " " + date.toTimeString().split(" ")[0];

  db2.open(secp_2, (err, conn) => {
    if (!err) {
      console.log("Connected Successfully");
    } else {
      console.log("Error occurred while connecting with DB2: " + err.message);
    }

    const insertIPAddress = `INSERT INTO IP_LOGGING("IP_ADDRESS", "SERVICE_CALLED", "TIME_OF_SERVICE")
                             VALUES (?, ?, ?)`;

    conn.query(
      insertIPAddress,
      [ipaddress, service, dateToInsert],
      (err, results) => {
        if (!err) {
          console.log("Data written to Database successfully");
        } else {
          console.log(
            "Error occurred while inserting IP data in database" + err.message
          );
        }

        conn.close((err) => {
          if (!err) {
            console.log("Connection closed with the database");
          } else {
            console.log(
              "Error occurred while trying to close the connection with the database" +
                err.message
            );
          }
        });
      }
    );
  });
}

module.exports = router;
