class UserData {
  constructor(data) {
    this.name = data.name;
    this.screenName = data.screen_name;
    this.profileImageUrl = data.profile_image_url;
    this.followersCount = data.followers_count;
    this.walletAddress = data.wallet_address;
    this.lastOfferedBid = data.last_offered_bid;
    this.lastOfferedBidDatetime = data.last_offered_bid_datetime;
    this.highestAcceptedBid = data.highest_accepted_bid;
    this.highestAcceptedBidDatetime = data.highest_accepted_bid_datetime;
  }

  // Getter methods
  getName() {
    return this.name;
  }

  getScreenName() {
    return this.screenName;
  }

  getProfileImageUrl() {
    return this.profileImageUrl;
  }

  getFollowersCount() {
    return this.followersCount;
  }

  getWalletAddress() {
    return this.walletAddress;
  }

  getLastOfferedBid() {
    return this.lastOfferedBid;
  }

  getLastOfferedBidDatetime() {
    return this.lastOfferedBidDatetime;
  }

  getHighestAcceptedBid() {
    return this.highestAcceptedBid;
  }

  getHighestAcceptedBidDatetime() {
    return this.highestAcceptedBidDatetime;
  }
}

// Usage example similar to previous usage
const users = responseData.map(userData => new UserData(userData));

users.forEach(user => {
  console.log('Name:', user.getName());
  console.log('Screen Name:', user.getScreenName());
  console.log('Profile Image URL:', user.getProfileImageUrl());
  console.log('Followers Count:', user.getFollowersCount());
  console.log('Wallet Address:', user.getWalletAddress());
  console.log('Last Offered Bid:', user.getLastOfferedBid());
  console.log('Last Offered Bid Datetime:', user.getLastOfferedBidDatetime());
  console.log('Highest Accepted Bid:', user.getHighestAcceptedBid());
  console.log('Highest Accepted Bid Datetime:', user.getHighestAcceptedBidDatetime());
});
