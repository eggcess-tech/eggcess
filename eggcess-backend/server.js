const express = require('express');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const https = require('https');
const http = require('http');
const fs = require('fs');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const session = require('express-session');
const dotenv = require('dotenv');
const PrivateKeyWallet = require('@thirdweb-dev/wallets').PrivateKeyWallet;
const ethers =  require('ethers');
const contractAbi =  require('./abi.json');
const e = require('express');
//const OpbnbTestnet =  require('@thirdweb-dev/chains').OpbnbTestnet;
//const OpbnbTestnet =  require('@thirdweb-dev/chains').BlastTestnet;
const OpbnbTestnet =  require('@thirdweb-dev/chains').BlastSepoliaTestnet;
const Opbnb =  require('@thirdweb-dev/chains').Opbnb;

const BlastTestnet =  require('@thirdweb-dev/chains').BlastSepoliaTestnet;
const BlastBlastmainnet =  require('@thirdweb-dev/chains').BlastBlastmainnet;

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

//Airdrop Description Constants
const CREATE_NEW_PROFILE = "Create New Profile";
const REFER_NEW_USER = "Refer New User";
const SUBMIT_BID = "Submit Bid";
const CLAIM_BID = "Claim Bid";
const SOCIAL_MEDIA_PROFILE_HAS_REFERRAL_LINK = "Social Media Profile has Referral Link";
const NEW_TWEET = "New Tweet";

const POINTS_T1_CREATE_NEW_PROFILE = 50;
const POINTS_T2_CREATE_NEW_PROFILE = 300;
const POINTS_T3_CREATE_NEW_PROFILE = 1000;
const POINTS_T4_CREATE_NEW_PROFILE = 10000;
const POINTS_T1_REFER_NEW_USER = 50;
const POINTS_T2_REFER_NEW_USER = 300;
const POINTS_T3_REFER_NEW_USER = 1000;
const POINTS_T4_REFER_NEW_USER = 10000;
const POINTS_SUBMIT_BID_MULTIPLIER = 0.1; //1 point for every $0.10
const POINTS_CLAIM_BID_MULTIPLIER = 0.1; //1 point for every $0.10
const POINTS_T1_SOCIAL_MEDIA_PROFILE_HAS_REFERRAL_LINK = 50;
const POINTS_T2_SOCIAL_MEDIA_PROFILE_HAS_REFERRAL_LINK = 300;
const POINTS_T3_SOCIAL_MEDIA_PROFILE_HAS_REFERRAL_LINK = 1000;
const POINTS_T4_SOCIAL_MEDIA_PROFILE_HAS_REFERRAL_LINK = 10000;
const POINTS_NEW_TWEET = 10;

const T1_FOLLOWERS = 1001;    //Less than 1,001 followers
const T2_FOLLOWERS = 5001;    //Less than 5,001 followers
const T3_FOLLOWERS = 100001;  //Less than 100,001 followers

const providerUrl = process.env.RPC_PROVIDER_URL; // BSC RPC endpoint
const provider = new ethers.providers.JsonRpcProvider(providerUrl);

//const symbol = 'BNBUSDT';
const symbol = 'ETHUSDT';


const getGasPrice = async () => {
  try {
    const gasPrice = await provider.getGasPrice();
    console.log(`Current gas price on BSC: ${ethers.utils.formatUnits(gasPrice, 'gwei')} Gwei`);
    return gasPrice;
  } catch (error) {
    console.error('Error getting gas price:', error);
  }
};

webpush.setVapidDetails(
  'mailto:' + process.env.VAPID_MAILTO,
  publicKey = process.env.VAPID_PUBLIC_KEY,
  privateKey = process.env.VAPID_PRIVATE_KEY,
  
)

app.use(cors({ origin: process.env.REACT_APP_ROOT_URL, credentials: true }));
// Increase the payload size limit to 1GB
app.use(express.json({ limit: '1gb' }));
app.use(express.urlencoded({ limit: '1gb', extended: true }));


// Add this line to serve static files
app.use('/api/attachments', express.static(path.join(__dirname, 'attachments')));

app.use(bodyParser.json()); // Parse incoming JSON requests

// In-memory data store for user profiles
const users = {};

passport.use(
  new TwitterStrategy(
    {
      consumerKey: process.env.TWITTER_CONSUMER_KEY,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
      callbackURL: process.env.CALLBACK_URL, // Point to your React app's URL (http://localhost:3000)
    },
    (token, tokenSecret, profile, done) => {
      // Store user profile data in memory
      users[profile.id] = profile;
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  // Serialize user data (store user ID in the session)
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  // Deserialize user data (retrieve user data from memory)
  const user = users[id];
  done(null, user);
});

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // Set to true if your site is served over HTTPS
    //httpOnly: true,
    // maxAge: null, // Uncomment this line to set no expiration (or omit the maxAge property)
  },
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/api/auth/twitter', (req, res, next) => {
  passport.authenticate('twitter')(req, res, next);
});


app.get('/api/auth/twitter/callback', passport.authenticate('twitter', {
  successRedirect: '/api/profile',
  failureRedirect: '/api/login',
}), (req, res) => {
  
});

  app.get('/api/login', (req, res) => {
      const redirectURL = `${process.env.REACT_APP_ROOT_URL}/linkSocial`;

  });


  app.get('/api/profile', (req, res) => {
    if (req.isAuthenticated()) {
      const user = req.user;
      console.log('Name:', user.displayName);
      console.log('Twitter:', user.username);
      console.log('Photo URL:', user.photos[0].value);

     // Create a JSON object with user data
      const userData = {
        "displayName": user.displayName,
        "username": user.username,
        "photos": user.photos[0].value
      };

     // Convert the JSON object to a JSON string
      const userDataString = JSON.stringify(userData);

      // Encode the userDataString if needed
      const encodedUserData = encodeURIComponent(userDataString);

      // Create the redirect URL with the encoded userData
      const redirectURL = `${process.env.REACT_APP_ROOT_URL}/pleaseWait?user=${encodedUserData}`;
      
      console.log("redirectURL: " + redirectURL);
      // Perform the server-side redirect
      res.redirect(redirectURL);
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  });

  const startServer = async () => {
  try {

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      dateStrings: 'date',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    setInterval(() => {
      const now = new Date();
      const hours = now.getUTCHours();
      const minutes = now.getUTCMinutes();
    
      connection.query('select 1');
      //console.log(hours);
      //console.log(minutes);
      // Check if it's 12:00 AM UTC
      if (hours === 0 && minutes === 0) {
        console.log('Running daily update at 12 AM UTC');
        updateTwitterProfileImages();
      }
    }, 60000); // Check every 2 minutes (adjust as needed)

  
    // Function to update Twitter profile images
    async function updateTwitterProfileImages() {
      try {
        // Fetch all users from the database
        const [usersRows] = await connection.execute('SELECT twitter, profile_image_url FROM users');

        // Use Promise.all to make parallel requests to Twitter API for each user
        const twitterApiRequests = usersRows.map(async (userRow) => {
          const username = userRow.twitter.replace(/@/, '');

          try {
            const response = await axios.get(`https://api.twitter.com/2/users/by/username/${username}?user.fields=public_metrics,profile_image_url`, {
              headers: {
                'Authorization': `Bearer ${process.env.BEARER}`,
              },
            });

            if (response.status === 200) {
              const twitterUser = response.data.data;

              // Check if the profile_image_url is different
              if (twitterUser.profile_image_url !== userRow.profile_image_url) {
                // Update the profile_image_url in the database
                await connection.execute('UPDATE users SET profile_image_url = ? WHERE twitter = ?', [twitterUser.profile_image_url, userRow.twitter]);
              }
            }
          } catch (error) {
            console.error(`Error updating profile_image_url for ${username}:`, error);
          }
        });

        // Wait for all Twitter API requests to complete
        await Promise.all(twitterApiRequests);

        console.log('Profile images updated successfully');
      } catch (error) {
        console.error('Error updating profile images:', error);
      }
    }

    // Route to get user by wallet address
    app.get('/api/user/:address', async (req, res) => {
      const { address } = req.params;
      console.error('Debug: enter get user: ' + address);
      try {
        const [rows] = await connection.execute('SELECT * FROM users WHERE wallet_address = ?', [address]);
        if (rows.length > 0) {
          res.status(200).json(rows[0]);
        } else {
          res.status(404).json({ message: 'User not found' });
        }
      } catch (error) {
        console.error('Error fetching user by address:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    app.get('/api/userUpdateEmail', async (req, res) => {
      const { wallet_address, email } = req.query;
      console.error('Debug: update email - wallet_address = ' + wallet_address); // Corrected variable name to wallet_address
      console.error('Debug: update email - email =  ' + email); // Corrected variable name to wallet_address
      try {
        const [rows] = await connection.execute('SELECT * FROM users WHERE wallet_address = ?', [wallet_address]); // Corrected variable name to wallet_address
        if (rows.length > 0) {
          // Assuming you have a function to update the email based on the wallet_address
          await connection.execute('UPDATE users SET email = ? WHERE wallet_address = ?', [email, wallet_address]); // Corrected variable name to wallet_address
          const [updatedRows] = await connection.execute('SELECT * FROM users WHERE wallet_address = ?', [wallet_address]); // Corrected variable name to wallet_address
          res.status(200).json(updatedRows[0]);
        } else {
          res.status(404).json({ message: 'User not found' });
        }
      } catch (error) {
        console.error('Error updating email or fetching user by address:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
    

    // Route to get user by wallet address
    app.get('/api/userByHandle/:eggcess_handle', async (req, res) => {
      const { eggcess_handle } = req.params;
     
      try {
        const [rows] = await connection.execute('SELECT * FROM users WHERE eggcess_handle = ?', [eggcess_handle]);
        if (rows.length > 0) {
          res.status(200).json(rows[0]);
        } else {
          res.status(404).json({ message: 'User not found' });
        }
      } catch (error) {
        console.error('Error fetching user by eggcess handle:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Route to get user by wallet address
    app.get('/api/countClaimed/:address', async (req, res) => {
      const { address } = req.params;
     
      try {
        const [rows] = await connection.execute('SELECT COUNT(ID) AS Total FROM eggcess.bids where ToAddress=? and claimed =1', [address]);
        res.status(200).json(rows[0]);
        
      } catch (error) {
        console.error('Error counting claimed records address:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    async function claimWallet(from_address, wallet_address, eggcess_handle, contract2, system_address)
    {
      try {
        
        console.log("from_address: " + from_address);
        console.log("wallet.getAddress(): " + system_address);
        console.log("eggcess_handle: " + eggcess_handle);
        console.log("wallet_address: " + wallet_address);
        
        // const options = {
        //  gasPrice: currentGasPrice, // Use the adjusted "max fee per gas"
        //  };

        // Call the updateToAddress function
        const tx = await contract2.updateToAddress(
          from_address, // Replace with the actual sender's address
          system_address, // Replace with the actual receiver's address
          eggcess_handle, // Replace with the actual social media handle
          wallet_address
        );
  
        // Wait for the transaction to be confirmed
        await tx.wait();
  
        console.log('UpdateToAddress transaction successful');
      } catch (error) {
        console.error('UpdateToAddress error:', error);
       
      }
    }

    // Route to create a new user
    app.post('/api/createUser', async (req, res) => {
      const { name, twitter, wallet_address, profile_image_url, ReferredBy, eggcess_handle, email} = req.body;
      const ReferralCode = await generateUniqueReferralCode();
      const emailValue = email !== undefined ? email : null;

      console.error('Debug: enter create user: ' + wallet_address);
      console.error('name: ' + name);
      console.error('twitter: ' + twitter);
      console.error('profile_image_url: ' + profile_image_url);
      console.error('ReferredBy: ' + ReferredBy);
      console.error('ReferralCode: ' + ReferralCode);
      console.error('eggcess_handle: ' + eggcess_handle);
      
      console.error('email: ' + emailValue);

      try {
        const [userexist] = await connection.execute('update users set name = ?, twitter = ?, wallet_address = ?, profile_image_url =? , ReferralCode = ?, ReferredBy = ?, eggcess_handle = ?, email = ? where eggcess_handle = ?', [name, twitter, wallet_address, profile_image_url, ReferralCode, ReferredBy, eggcess_handle, emailValue, eggcess_handle]);
        
        console.log("Updated user: " + userexist.affectedRows);

        


        if (userexist.affectedRows == 0)
        {
          await connection.execute('INSERT INTO users (name, twitter, wallet_address, profile_image_url, ReferralCode, ReferredBy, eggcess_handle, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [name, twitter, wallet_address, profile_image_url, ReferralCode, ReferredBy, eggcess_handle, emailValue]);
          console.log('Handler claimed!');
        }
        else
        {
          const [updatedRows] = await connection.execute('SELECT * FROM bids WHERE ToAddress = ?', [eggcess_handle]);
          const [FromAddressExist] = await connection.execute('UPDATE bids b ' +
          'INNER JOIN users u ON b.FromAddress = u.old_wallet_address ' +
          'SET b.FromAddress = u.wallet_address ' +
          'WHERE u.eggcess_handle = ? ' +
          'AND b.id > 0', [eggcess_handle]);
        
          console.log("FromAddressExist: " + FromAddressExist.affectedRows);

        const [ToAddressExist] = await connection.execute('UPDATE bids b ' +
          'INNER JOIN users u ON b.ToAddress = u.old_wallet_address ' +
          'SET b.ToAddress = u.wallet_address ' +
          'WHERE u.eggcess_handle = ? ' +
          'AND b.id > 0', [eggcess_handle]);
    
        console.log("ToAddressExist: " + ToAddressExist.affectedRows);
          if (updatedRows.length > 0) {
            // Group the rows by FromAddress
            const rowsByFromAddress = updatedRows.reduce((accumulator, row) => {
              const fromAddress = row.FromAddress;
              accumulator[fromAddress] = accumulator[fromAddress] || [];
              accumulator[fromAddress].push(row);
              return accumulator;
            }, {});
            
            const privateKey = process.env.REACT_APP_E_WALLET_ADDRESS_PK;
            const wallet = new PrivateKeyWallet(privateKey, process.env.NODE_ENV === 'production' ? BlastBlastmainnet : BlastTestnet);
            const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
            // Connect to the contract using the wallet
            const contract2 = new ethers.Contract(contractAddress, contractAbi, await wallet.getSigner());
            const system_address = await wallet.getAddress();
            //const currentGasPrice = await getGasPrice();

            for (const fromAddress in rowsByFromAddress) {
              // Update the rows in this group
              await claimWallet(fromAddress , wallet_address, eggcess_handle, contract2, system_address);
            }
          
            console.log('Handler claimed!');
            console.log('Bids claimed!');

            
          } else {
            console.log('No rows to update.');
          }
        }
        
          await connection.execute('update bids set ToAddress = ? where ToAddress = ?', [wallet_address, eggcess_handle]);
          
          console.log('User created successfully!');

          //Award airdrop points for new eggcess user creation
          console.log('Awarding Airdrop Points for new User creation!');

          

          const response = await axios.get(`https://api.twitter.com/2/users/by/username/${twitter}?user.fields=public_metrics,profile_image_url`, {
          headers: {
            'Authorization': `Bearer ${process.env.BEARER}`, // Use backticks and ${} to interpolate the token
          },
        });

        
        if (response.status == 200)
        {
          console.log('Twitter response user found:');
          const twitterUser = response.data.data;
          console.log(twitterUser);
         
          let airdropType = CREATE_NEW_PROFILE;
          let points = 0;          
          let referralpoints = 0;
          console.log("Followers Count: " + twitterUser.public_metrics.followers_count);
          switch (true)
          {
            case twitterUser.public_metrics.followers_count < T1_FOLLOWERS:
              points = POINTS_T1_CREATE_NEW_PROFILE;
              referralpoints = POINTS_T1_REFER_NEW_USER;
              break;
            case twitterUser.public_metrics.followers_count < T2_FOLLOWERS:
              points = POINTS_T2_CREATE_NEW_PROFILE;
              referralpoints = POINTS_T2_REFER_NEW_USER;
              break;
            case twitterUser.public_metrics.followers_count < T3_FOLLOWERS:
              points = POINTS_T3_CREATE_NEW_PROFILE;
              referralpoints = POINTS_T3_REFER_NEW_USER;
              break;
            default:
              points = POINTS_T4_CREATE_NEW_PROFILE;
              referralpoints = POINTS_T4_REFER_NEW_USER;
              break;
          }
          console.log('Points Awarded to new user ' + twitter + ' : ' + points);
          await connection.execute('INSERT INTO airdrop (date_time, wallet_address, type, points) VALUES (NOW(), ?, ?, ?)', [wallet_address, airdropType, points]);
          console.log('Airdrop points awarded for ' + wallet_address + ' : User created successfully!');

          //Award airdrop points for eggcess user who referred this new user
          //Get eggcess user
          const [rows] = await connection.execute('SELECT * FROM users WHERE ReferralCode = ?', [ReferredBy]);
          if (rows.length == 1) {
            airdropType = REFER_NEW_USER;
            await connection.execute('INSERT INTO airdrop (date_time, wallet_address, type, points) VALUES (NOW(), ?, ?, ?)', [rows[0].wallet_address, airdropType, referralpoints]);
            console.log('Airdrop points awarded for ' + wallet_address + ' : Referred New User!');
          }
          else {
            console.error('Airdrop points error: User ReferralCode not found or duplicate records found');
          }          
        }
        else if (response.status == 404)
        {
          console.error('Twitter response user not found and airdrop points not awarded');
        }

        const [rows] = await connection.execute('SELECT * FROM users WHERE wallet_address = ?', [wallet_address]);
        
        console.log(rows[0]);
        
        res.status(200).json({ success: true, data: rows[0] });
      } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ success: false, error: error.code });
      }
    });

    async function generateUniqueReferralCode() {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let referralCode = '';
    
      try {
        const [existingReferralCodes] = await connection.execute('SELECT ReferralCode FROM users');
        
        const existingCodesSet = new Set(existingReferralCodes.map(row => row.ReferralCode));
    
        do {
          referralCode = '';
    
          for (let i = 0; i < 10; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            referralCode += characters.charAt(randomIndex);
          }
        } while (existingCodesSet.has(referralCode));
      } catch (error) {
        console.error('Error retrieving existing referral codes:', error);
      }
    
      return referralCode;
    }
    
    app.get('/api/get_points/:address', async (req, res) => {
      const { address } = req.params;
    
      try {
        const [rows] = await connection.execute(
          'SELECT * FROM (SELECT ' +
            'ROW_NUMBER() OVER (ORDER BY SUM(points) DESC) AS Ranking, ' +
            'wallet_address, ' +
            'SUM(points) AS Points ' +
        'FROM ' +
            'eggcess.airdrop ' +
            'GROUP BY ' +
            'wallet_address ' +
            'ORDER BY ' +
            'SUM(points) DESC) R ' +
            'WHERE wallet_address = ?',
          [address]
        );
    
        //console.log('Bids fetched:', rows);
        res.json(rows);
      } catch (error) {
        console.error('Error fetching points:', error);
        res.status(500).json({ success: false, error: 'Error fetching points' });
      }
    });

    app.get('/api/search-twitter', async (req, res) => {
      const { username } = req.query;
      const username1 = username.replace(/@/, '')
      console.log('Searching Twitter users: ' + username1);
    
      try {
        const response = await axios.get(`https://api.twitter.com/2/users/by/username/${username1}?user.fields=public_metrics,profile_image_url`, {
          headers: {
            'Authorization': `Bearer ${process.env.BEARER}`,
          },
        });
    
        let userData = []; // Initialize userData as an empty array
    
        if (response.status === 200) {
          console.log('Twitter response user found:');
          const twitterUser = response.data.data;
    
          // Search the database for a user with the matching Twitter screen_name
          const [rows] = await connection.execute(`
            SELECT
              users.wallet_address,
              users.twitter,
              highest_accepted_bid,
              highest_accepted_bid_datetime,
              eggcess_handle,
              last_offered_bid,
              last_offered_bid_datetime,
              COALESCE(AVG(reviews.rating), 5) AS eggcess_rating
            FROM users
            LEFT JOIN bids ON users.wallet_address = bids.FromAddress
            LEFT JOIN reviews ON bids.id = reviews.bid_id
            WHERE users.twitter = ?
            GROUP BY users.wallet_address, users.twitter, highest_accepted_bid, highest_accepted_bid_datetime, eggcess_handle, last_offered_bid, last_offered_bid_datetime
          `, [twitterUser.username]);
    
          if (rows.length > 0) {
            // Database user found, update userData with database information
            const databaseUser = rows[0];

            const data 
             = {
              name: twitterUser.name,
              screen_name: twitterUser.username,
              profile_image_url: twitterUser.profile_image_url,
              followers_count: twitterUser.public_metrics.followers_count,
              eggcess_handle: databaseUser.eggcess_handle,
              wallet_address: databaseUser.wallet_address,
              highest_accepted_bid: databaseUser.highest_accepted_bid,
              highest_accepted_bid_datetime: databaseUser.highest_accepted_bid_datetime,
              last_offered_bid: databaseUser.last_offered_bid,
              last_offered_bid_datetime: databaseUser.last_offered_bid_datetime,
              eggcess_rating: databaseUser.eggcess_rating,
            };

            userData.push(data);
          } else {
            // Database user not found, use Twitter information only
            const data = {
              name: twitterUser.name,
              screen_name: twitterUser.username,
              profile_image_url: twitterUser.profile_image_url,
              followers_count: twitterUser.public_metrics.followers_count,
              eggcess_handle: twitterUser.username + "@twitter",
              wallet_address: twitterUser.username + "@twitter",
            };

            userData.push(data);
          }
    
          //console.log('Response Data:', userData);
        } else if (response.status === 404) {
          console.log('Twitter response user not found:');
          res.status(404).json({ error: 'User not found' });
          return;
        }
    
        console.log('User Data:', userData);
        res.json({ userData }); // Send userData in the JSON response
      } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ error: 'Error searching users' });
      }
    });
    

    //Submit a Bid (amount = bid amount) or Claim a Bid (amount = 0) :
    app.post('/api/bids', async (req, res) => {
      const { 
        send_date, 
        from_address, 
        to_address, 
        encrypted_text, 
        attachment_data, 
        attachment_extension, 
        coin_address,
        coin_symbol, 
        amount,
        claimed,
        claimed_date,
        review_star, 
        review_text
      } = req.body;
    
      try {
        let formattedSendDate = null;
        let attachment_path = null;
        
        if (attachment_data) {
          formattedSendDate = send_date.replace(/-/g, '').replace(/:/g, '').replace(' ', '').replace('T', '').split('.')[0]; // Remove milliseconds if any
          attachment_path = `attachments/${from_address}_${formattedSendDate}.txt`;
          fs.writeFileSync(__dirname + '/' + attachment_path, attachment_data);
        }
    
        const [rowsInserted]  = await connection.execute('INSERT INTO bids (SendDate, FromAddress, ToAddress, Text, AttachmentPath, CoinAddress, CoinSymbol, Amount, Claimed, ClaimedDate, ReviewStar, ReviewText, AttachmentExtension) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
          send_date || null,
          from_address || null,
          to_address || null,
          encrypted_text || null,
          attachment_path || null,
          coin_address || null,
          coin_symbol || null,
          amount || null,
          claimed,
          claimed_date || null,
          review_star || null,
          review_text || null,
          attachment_extension || null]);
          
          const newBidId = rowsInserted.insertId;
          console.log('Newly inserted bid ID:', newBidId);

        // Set Airdrop variables
        let bidClaimAmount = 0;
        let airdropType = '';
        let airdropMultiplier = 0;        
        let airdropWallet = '';
        let points = 0;

        // Check if amount is 0 and update bids table accordingly
        if (amount === 0 || amount === null || amount === '') {

          console.log("Trying to claim bids...")

          // Set Airdrop variables for Claim Bid
          const whereSQL = ' WHERE ToAddress = ? AND FromAddress = ? AND Amount > 0 AND Claimed = 0';
          let query = 'SELECT SUM(Amount) AS claim_amount from bids ' + whereSQL;
          const [rows] = await connection.execute(query, [from_address, to_address]);
          bidClaimAmount = rows[0].claim_amount;
          airdropType = CLAIM_BID;
          airdropMultiplier = POINTS_CLAIM_BID_MULTIPLIER;
          airdropWallet = from_address;

          const updateBidQuery = 'UPDATE bids SET Claimed = true, ClaimedDate = ? ' + whereSQL;
          const [rowsBidsUpdated] = await connection.execute(updateBidQuery, [send_date, from_address, to_address]);
          console.log('Claimed records:' + rowsBidsUpdated.affectedRows);
          if (rowsBidsUpdated.affectedRows > 0) {

            // Update Highest Accepted Bid if the current claimed bid is the highest
            let updateUserQuery = 'UPDATE users SET highest_accepted_bid = ? , highest_accepted_bid_datetime = NOW() ';
            updateUserQuery += ' WHERE wallet_address = ? AND IFNULL(highest_accepted_bid, 0) < ? ';
            await connection.execute(updateUserQuery, [bidClaimAmount, airdropWallet, bidClaimAmount]);
            console.log('User wallet ' + airdropWallet + ' Highest Accepted Bid updated to ' + bidClaimAmount);
            
            // Insert into reviews table if rows were updated
            const reviewInsertQuery = 'INSERT INTO reviews (bid_id) VALUES (?)';
            await connection.execute(reviewInsertQuery, [newBidId]);
            console.log('Review inserted successfully.');
          }
          else{
            console.log("Nothing to claim");
          }
        } 
        else {
          console.log('Bid sent successfully!');
          

          // Set Airdrop variables for Submit Bid
          bidClaimAmount = amount;
          airdropType = SUBMIT_BID;
          airdropMultiplier = POINTS_SUBMIT_BID_MULTIPLIER;
          airdropWallet = from_address;
        }
        
        // Award Airdrop points for bidding and claiming
        if (bidClaimAmount != 0) {          
          const response = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
          if (response.data && response.data.price) {
            let bnbPrice = response.data.price;
            console.log('BNB Price: ' + bnbPrice);          
            let dollarValue = bidClaimAmount * bnbPrice;
            points = Math.floor(dollarValue / airdropMultiplier);
            await connection.execute('INSERT INTO airdrop (date_time, wallet_address, type, points) VALUES (NOW(), ?, ?, ?)', [airdropWallet, airdropType, points]);
            console.log('Airdrop points awarded for ' + airdropWallet + ' : ' + airdropType + 'of $' + dollarValue + ' : ' + points);
          }
        }
    
        res.status(200).json({ success: true });

        const [rows] = await connection.execute('SELECT * FROM notifications WHERE wallet_address = ?', [to_address]);
        const errorSubscription = []
        let id = 0;
        for (const row of rows) {
          try {
            const subscription = JSON.parse(row.subscription);
            id = row.id;
            // Check if the row has a valid subscription
            if (subscription && typeof subscription === 'object') {
              console.log("Sending notification to " + to_address);
              await webpush.sendNotification(subscription, "You have received a new message.");
            }
          }
           catch (error) {
            // Check the type of error and handle accordingly
            if (error instanceof webpush.WebPushError) {
              console.log("WebPushError statusCode:", error.statusCode);
              errorSubscription.push(id);
            } else {
              console.log("Unexpected error:", error);
            }

          }
        }
        console.log(errorSubscription);
        if (errorSubscription.length > 0) {
          const placeholders = errorSubscription.map(() => '?').join(',');
          await connection.execute(`DELETE FROM notifications WHERE id IN (${placeholders})`, errorSubscription);
        }


      } catch (error) {
        console.error('Error sending bid:', error);
        res.status(500).json({ success: false, error: 'Error sending bid' });
      }
    });

    app.get('/api/bids', async (req, res) => {
      const { from_address, to_address, eggcess_handle, latest_timestamp } = req.query;
      
      try {
        const cleanedEggcessHandle = eggcess_handle || '';
        
        let query = 'SELECT * from bid_user_information_view WHERE ';
        const params = [from_address, to_address, cleanedEggcessHandle, to_address, cleanedEggcessHandle, from_address];
        // console.log("from_address: " + from_address);
        // console.log("to_address: " + to_address);
        // console.log("eggcess_handle: " + eggcess_handle);
        // console.log("latest_timestamp: " + latest_timestamp);
        query += '((FromAddress = ? AND (ToAddress = ? || to_eggcess_handle = ?)) OR ((FromAddress = ? || From_eggcess_handle = ?) AND ToAddress = ?)) ';
        
        if (latest_timestamp !== '') {
          query += 'AND (SendDate > ? OR ClaimedDate > ? OR review_datetime > ?)';
          params.push(latest_timestamp);
          params.push(latest_timestamp);
          params.push(latest_timestamp);
        }

        query += "order by senddate asc";
        // console.log(params);
        
        // console.log(query);

        const [rows, fields] = await connection.execute(query, params);
        
        // console.log('Bids fetched:', rows);
        res.json(rows);
      } catch (error) {
        console.error('Error fetching bids:', error);
        res.status(500).json({ success: false, error: 'Error fetching bids' });
      }
    });

    app.get('/api/isKOL', async (req, res) => {
      const { from_address, to_address, latest_timestamp } = req.query;
      
      try {
        let query = 'SELECT (ToAddress = ?) AS IsKOL ' + 
        'FROM bid_user_information_view '+
        'WHERE ';

        const params = [from_address, from_address, to_address, to_address, from_address];
        
        query += '((FromAddress = ? AND ToAddress = ?) OR (FromAddress = ? AND ToAddress = ?)) ';
        query += 'order by ID LIMIT 1';

        const [rows, fields] = await connection.execute(query, params);
        
        res.json(rows);
      } catch (error) {
        console.error('Error fetching bids:', error);
        res.status(500).json({ success: false, error: 'Error fetching bids' });
      }
    });

    app.get('/api/getClaimable', async (req, res) => {
      const { from_address, to_address } = req.query;
      
      try {
        let query = 'SELECT SUM(Amount) AS Claimable ' + 
        'FROM bid_user_information_view '+
        'WHERE ';

        const params = [to_address, from_address];
        
        query += 'FromAddress = ? AND ToAddress = ? ';
        query += 'and Claimed=0';

        const [rows, fields] = await connection.execute(query, params);
        
        res.json(rows);
      } catch (error) {
        console.error('Error fetching bids:', error);
        res.status(500).json({ success: false, error: 'Error fetching bids' });
      }
    });
    

    app.get('/api/incoming_bids/:address', async (req, res) => {
      const { address } = req.params;
    
      try {
        const [rows] = await connection.execute(
          'SELECT ' + 
          'MAX(ID) AS ID,  ' + 
          'MAX(SendDate) AS LatestSendDate, ' + 
          'FromAddress AS wallet_address,  ' + 
          'from_user_twitter AS screen_name,  ' + 
          'from_user_name AS name,  ' + 
          'from_user_profile_image_url as profile_image_url,  ' + 
          'from_eggcess_handle as eggcess_handle, ' + 
          'SUM(Amount) AS Total,  ' + 
          'Count(ID) AS NewMessages,  ' + 
          'MAX(CoinSymbol) as CoinSymbol   ' + 
          'FROM eggcess.bid_user_information_view  ' + 
          'WHERE to_user_wallet_address = ? and Amount > 0 and Claimed = 0 ' + 
          'GROUP BY FromAddress, ToAddress, from_eggcess_handle, from_user_profile_image_url, from_user_name, from_user_twitter  ' + 
          'order by Total desc, LatestSendDate desc',
          [address]
        );
        //console.log('address:', address);
        //console.log('Bids fetched:', rows);
        res.json(rows);
      } catch (error) {
        console.error('Error fetching bids:', error);
        res.status(500).json({ success: false, error: 'Error fetching bids' });
      }
    });

    app.get('/api/your_bids/:address', async (req, res) => {
      const { address } = req.params;
    
      try {
        const [rows] = await connection.execute(
          'SELECT * FROM eggcess.bid_user_information_view ' +
          'WHERE from_user_wallet_address = ? and Amount > 0  and (isNUll(Claimed) or Claimed = 0 ) ' + 
          'order by Amount desc, SendDate',
          [address]
        );
    
        //console.log('Bids fetched:', rows);
        res.json(rows);
      } catch (error) {
        console.error('Error fetching bids:', error);
        res.status(500).json({ success: false, error: 'Error fetching bids' });
      }
    });
    
    app.get('/api/global_bids/', async (req, res) => {
      
    
      try {
        const [rows] = await connection.execute(
          'SELECT * FROM eggcess.bid_user_information_view WHERE amount > 0 ORDER BY SendDate DESC LIMIT 50'
        );
    
        //console.log('Bids fetched:', rows);
        res.json(rows);
      } catch (error) {
        console.error('Error fetching bids:', error);
        res.status(500).json({ success: false, error: 'Error fetching bids' });
      }
    });

    app.get('/api/top_bids/', async (req, res) => {
      
    
      try {
        const [rows] = await connection.execute(
          'SELECT * FROM eggcess.bid_user_information_view where Amount > 0 ORDER BY Amount desc, senddate desc LIMIT 100;'
        );
    
        //console.log('Bids fetched:', rows);
        res.json(rows);
      } catch (error) {
        console.error('Error fetching bids:', error);
        res.status(500).json({ success: false, error: 'Error fetching bids' });
      }
    });

    app.get('/api/chats_earning/:address', async (req, res) => {
      const { address } = req.params;
    
      try {
        //console.log('address:', address);
        const [rows] = await connection.execute(
          'SELECT  ' +
          'MAX(ID) AS ID, ' +
          'MAX(SendDate) AS LatestSendDate, ' +
          'FromAddress AS wallet_address, ' +
          'from_user_twitter AS screen_name, ' +
          'from_user_name AS name, ' +
          'from_user_highest_accepted_bid AS highest_accepted_bid, ' +
          'from_user_profile_image_url as profile_image_url, ' +
          'from_eggcess_handle as eggcess_handle, ' +
          'SUM(Amount) AS Total, ' +
          'MAX(CoinSymbol) as CoinSymbol ' +
          'FROM ' +
          'eggcess.bid_user_information_view ' +
          'WHERE ToAddress = ? and Amount > 0 ' +
          'GROUP BY FromAddress, ToAddress, from_user_highest_accepted_bid, from_eggcess_handle, from_user_profile_image_url, from_user_name, from_user_twitter ' + 
          'ORDER BY MAX(SendDate) desc',
          [address]
        );
        
        //console.log('Bids fetched:', rows);
        res.json(rows);
      } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({ success: false, error: 'Error fetching bids' });
      }
    });
    
    app.get('/api/chats_bidding/:address', async (req, res) => {
      const { address } = req.params;
    
      try {
        //console.log('address:', address);
        const [rows] = await connection.execute(
          'SELECT  ' +
          'MAX(ID) AS ID, ' +
          'MAX(SendDate) AS LatestSendDate, ' +
          'ToAddress AS wallet_address, ' +
          'to_user_twitter AS screen_name, ' +
          'to_user_name AS name, ' +
          'to_user_highest_accepted_bid AS highest_accepted_bid, ' +
          'to_user_profile_image_url as profile_image_url, ' +
          'to_eggcess_handle as eggcess_handle, ' +
          'SUM(Amount) AS Total, ' +
          'MAX(CoinSymbol) as CoinSymbol ' +
          'FROM ' +
          'eggcess.bid_user_information_view ' +
          'WHERE FromAddress = ? and Amount > 0 ' +
          'GROUP BY ToAddress, FromAddress, to_user_highest_accepted_bid, to_eggcess_handle, to_user_profile_image_url, to_user_name, to_user_twitter ' + 
          'ORDER BY MAX(SendDate) desc',
          [address]
        );
        
        //console.log('Bids fetched:', rows);
        res.json(rows);
      } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({ success: false, error: 'Error fetching bids' });
      }
    });

    app.get('/api/chats_all/:address', async (req, res) => {
      const { address } = req.params;
    
      try {
        //console.log('address:', address);
        const [rows] = await connection.execute(
          'SELECT  ' + 
          'ID, ' + 
          'LatestSendDate, ' + 
          'wallet_address, ' + 
          'name, ' + 
          'screen_name, ' + 
          'profile_image_url, ' + 
          'eggcess_handle, ' + 
          'Total, ' + 
          'text, ' + 
          'CoinSymbol, ' + 
          'FromAddress ' + 
          'FROM ( ' + 
            'SELECT  ' + 
            '  ID, ' + 
            '  SendDate AS LatestSendDate, ' + 
            '  CASE WHEN FromAddress = ? THEN ToAddress ELSE FromAddress END AS wallet_address, ' + 
            '  CASE WHEN FromAddress = ? THEN to_user_name ELSE from_user_name END AS name, ' + 
            '  CASE WHEN FromAddress = ? THEN to_user_twitter ELSE from_user_twitter END AS screen_name, ' + 
            '  CASE WHEN FromAddress = ? THEN to_user_profile_image_url ELSE from_user_profile_image_url END AS profile_image_url, ' + 
            '  CASE WHEN FromAddress = ? THEN to_eggcess_handle ELSE from_eggcess_handle END AS eggcess_handle, ' + 
            '  Amount AS Total, ' + 
            '  Text, ' + 
            '  CoinSymbol, ' +
            '  FromAddress, ' + 
            '  ROW_NUMBER() OVER (PARTITION BY CASE WHEN FromAddress = ? THEN ToAddress ELSE FromAddress END ORDER BY SendDate DESC) AS RowNum ' + 
            'FROM  ' + 
            '  eggcess.bid_user_information_view  ' + 
            'WHERE ' +
            '  (ToAddress = ? OR FromAddress = ?) ' + 
            ') AS SubQuery ' + 
            'WHERE  ' + 
            'RowNum = 1 ' + 
            'ORDER BY LatestSendDate DESC;',
          [address, address, address, address, address, address, address, address]
        );
        
        //console.log('Bids fetched:', rows);
        res.json(rows);
      } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({ success: false, error: 'Error fetching bids' });
      }
    });

    // Create a route for updating a review
app.post('/api/give_review/:reviewId', async (req, res) => {
  const reviewId = req.params.reviewId; // Extract the review ID from the URL
  const { rating, reviewText, reviewDate } = req.body; // Get rating and review text from the request body
  const sql = 'UPDATE reviews SET rating = ?, text = ?, datetime = ? WHERE id = ?';
  
  try{
    const [rows] = await connection.execute(
      sql,
      [rating, reviewText, reviewDate, reviewId]
    );

    console.log('Review updated successfully');
    return res.status(200).json({ message: 'Review updated successfully' });
  
  }catch (error) 
  {
    console.error('Error updating review:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
  
  
});

    //Update a Bid:
    app.patch('/api/claim_bids/:id', async (req, res) => {
      const bidId = req.params.id;
      const { Claimed, ClaimedDate } = req.body;
      const updatedBid = {
        Claimed,
        ClaimedDate,
      };
      const sql = 'UPDATE bids SET ? WHERE id = ?';

      try{
        
        const [rows] = await connection.execute(
          sql,
          [updatedBid, bidId]
        );
    
        console.log('Claimed successfully');
        return res.status(200).json({ message: 'Claimed successfully' });

      }
      catch(error){
        console.error('Error Claiming:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      
    });

    app.delete('/api/bids/:id', async (req, res) => {
      const bidId = req.params.id;
    
      try {
        // Check if the bid with the given ID exists
        const [bidRows] = await connection.execute('SELECT * FROM bids WHERE id = ?', [bidId]);
        if (bidRows.length === 0) {
          return res.status(404).json({ error: 'Bid not found' });
        }
    
        // Delete the bid by ID
        await connection.execute('DELETE FROM bids WHERE id = ?', [bidId]);
    
        console.log('Bid deleted successfully!');
        return res.status(200).json({ success: true });
      } catch (error) {
        console.error('Error deleting bid:', error);
        return res.status(500).json({ success: false, error: 'Error deleting bid' });
      }
    });

    // Express route to add a review for a bid
    app.post('/api/add_review/:bid_id', (req, res) => {
      const bidId = req.params.bid_id;
    
      const review = {
        bid_id: bidId,
      };

      const sql = 'INSERT INTO reviews SET ?';

      connection.query(sql, review, (err, result) => {
        if (err) {
          console.error('Error adding review:', err);
          res.status(500).json({ error: 'An error occurred while adding the review.' });
        } else {
          res.json({ message: 'Review added successfully.' });
        }
      });
    });
  
    app.get('/api/get_leaderboard/', async (req, res) => {
      
    
      try {
        const [rows] = await connection.execute(
          'SELECT twitter, profile_image_url, SUM(points) as Total, name, twitter AS screen_name, profile_image_url, users.wallet_address, highest_accepted_bid, highest_accepted_bid_datetime, eggcess_handle, last_offered_bid, last_offered_bid_datetime ' +
          'FROM eggcess.airdrop ' +
          'INNER JOIN eggcess.users on users.wallet_address = airdrop.wallet_address ' +
          'WHERE date_time >= NOW() - INTERVAL 1 WEEK AND users.wallet_address != users.eggcess_handle ' +
          'GROUP BY twitter, profile_image_url, profile_image_url, users.wallet_address, highest_accepted_bid, highest_accepted_bid_datetime, eggcess_handle, last_offered_bid, last_offered_bid_datetime ' +
          'Order By SUM(points) desc'         
        );
    
        //console.log('Bids fetched:', rows);
        res.json(rows);
      } catch (error) {
        console.error('Error fetching bids:', error);
        res.status(500).json({ success: false, error: 'Error fetching bids' });
      }
    });
    
    
    app.post('/api/save_subscription/', async (req, res) => {
      try {
        const { subscription, wallet_address } = req.body;

        console.log("Saving subscription.");
        // Now you can use both subscription and wallet_address as needed
        console.log("Subscription:", subscription);
        console.log("Wallet Address:", wallet_address);
       
        await connection.execute('INSERT INTO notifications (wallet_address, subscription) VALUES (?, ?)', [wallet_address, subscription]);
          
        res.json({ status: "Success", message: "Subscription saved!"})
       
      } catch (error) {
        console.error('Error saving subscription:', error);
        res.status(500).json({ success: false, error: 'Error fetching bids' });
      }
    });
    
    app.get('/api/send_notification/', async (req, res) => {
      try {
        console.log("Sending notification.");
        //console.log(subDatabase[subDatabase.length-1]);
        //webpush.sendNotification(subDatabase[subDatabase.length-1], "Message from eggcess.");
        res.json({ status: "Success", message: "Message sent to push service."})
       
      } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({ success: false, error: 'Error fetching bids' });
      }
    });

    app.get('/api/account_funded/', async (req, res) => {
      const email = req.query.email; // Assuming email is passed as a query parameter
    
      try {
        // Assuming you have a function to fetch the wallet_address based on the email
        const [userRows] = await connection.execute('SELECT wallet_address FROM eggcess.users WHERE email = ?', [email]);
    
        if (userRows.length === 0) {
          res.json({
            data: {
              result: false
            }
          });
          return;
        }
    
        const walletAddress = userRows[0].wallet_address;

        //console.log(walletAddress);
    
        // Use ethers.js to get the balance of the wallet in Ether
        const balanceInWei = await provider.getBalance(walletAddress);
        
    
        // Convert balance to Ether
        const balanceInEther = ethers.utils.formatEther(balanceInWei);
        //console.log(balanceInEther);
    
        // Check if the balance is greater than 0 Ether
        const isAccountFunded = parseFloat(balanceInEther) > 0;
    
        res.json({
          data: {
            result: isAccountFunded
          }
        });
      } catch (error) {
        console.error('Error checking deposit:', error);
        res.status(200).json({
          error: {
            code: 0,
            message: error.message || 'Failed'
          },
          data: {
            result: false
          }
        });
      }
    });

    app.get('/api/first_tx_made/', async (req, res) => {
      const email = req.query.email;
    
      try {
        const [userRows] = await connection.execute('SELECT wallet_address FROM eggcess.users WHERE email = ?', [email]);
    
        if (userRows.length === 0) {
          res.json({
            data: {
              result: false
            }
          });
          return;
        }
    
        const walletAddress = userRows[0].wallet_address;
        //console.log(walletAddress);
    
        const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
        //console.log(contractAddress);
    
        const transactionCount = await provider.getTransactionCount(walletAddress, 'latest');
        //console.log(transactionCount);
    
        const hasMadeTransaction = transactionCount > 0;
    
        res.json({
          data: {
            result: hasMadeTransaction
          }
        });
      } catch (error) {
        console.error('Error checking first transaction:', error);
        res.status(200).json({
          error: {
            code: 0,
            message: error.message || 'Failed'
          },
          data: {
            result: false
          }
        });
      }
    });
    
    

 /*
    const options = {
      key: fs.readFileSync('C:/key.pem'),
      cert: fs.readFileSync('C:/cert.pem')
    };

    https.createServer(options, app).listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    }); */

    http.createServer(app).listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

  } catch (error) {
    console.error('Error starting the server:', error);
  }
  
};



startServer();
