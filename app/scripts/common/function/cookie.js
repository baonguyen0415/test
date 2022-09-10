export let cookie = {
  get: function (key) {
    var keyValue = document.cookie.match("(^|;) ?" + key + "=([^;]*)(;|$)");
    return keyValue ? JSON.parse(keyValue[2]) : null;
  },
  set: function (key, value, expiry) {
    var expires = new Date();
    expires.setTime(expires.getTime() + expiry * 24 * 60 * 60 * 1000);
    document.cookie = key + "=" + JSON.stringify(value) + ";expires=" + expires.toUTCString() + ";path=/";
  },
  delete: function (key) {
    var keyValue = this.get(key);
    this.set(key, keyValue, "-1");
  },
};
