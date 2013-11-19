(function() {
	var e, t, i, n, r, o, s, u, a, l, c, h, d, f, p, g, m, y, _, w, v, b, S, k, x, A, C, N, T, D, R = {}.hasOwnProperty, E = function(e, t) {
		return function() {
			return e.apply(t, arguments)
		}
	}, O = [].slice;
	window.handle_initialization = null;
	window.loaded = false;
	window.handleClientLoad = function() {
		console.log("loaded CALLED");
		window.loaded = true;
		if (window.gdrive_initialized) {
			return Nimbus.Auth.initialize()
		}
	};
	k = document.getElementsByTagName("head")[0];
	A = document.createElement("script");
	A.type = "text/javascript";
	A.src = "https://apis.google.com/js/client.js?onload=handleClientLoad";
	k.appendChild(A);
	i = function() {
		function e(e) {
			this.client = new n(e)
		}
		return e
	}();
	i.ApiError = function() {
		function e(e, t, i) {
			var n;
			this.method = t;
			this.url = i;
			this.status = e.status;
			if (e.responseType) {
				n = e.response || e.responseText
			} else {
				n = e.responseText
			}
			if (n) {
				try {
					this.responseText = n.toString();
					this.response = JSON.parse(n)
				} catch(r) {
					this.response = null
				}
			} else {
				this.responseText = "(no response)";
				this.response = null
			}
		}
		e.prototype.toString = function() {
			return "Dropbox API error " + this.status + " from " + this.method + " " + this.url + " :: " + this.responseText
		};
		e.prototype.inspect = function() {
			return this.toString()
		};
		return e
	}();
	if ( typeof window !== "undefined" && window !== null) {
		if (window.atob && window.btoa) {
			f = function(e) {
				return window.atob(e)
			};
			_ = function(e) {
				return window.btoa(e)
			}
		} else {
			g = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
			w = function(e, t, i) {
				var n, r;
				r = 3 - t;
				e <<= r * 8;
				n = 3;
				while (n >= r) {
					i.push(g.charAt(e >> n * 6 & 63));
					n -= 1
				}
				n = t;
				while (n < 3) {
					i.push("=");
					n += 1
				}
				return null
			};
			p = function(e, t, i) {
				var n, r;
				r = 4 - t;
				e <<= r * 6;
				n = 2;
				while (n >= r) {
					i.push(String.fromCharCode(e >> 8 * n & 255));
					n -= 1
				}
				return null
			};
			_ = function(e) {
				var t, i, n, r, o, s;
				r = [];
				t = 0;
				i = 0;
				for ( n = o = 0, s = e.length; 0 <= s ? o < s : o > s; n = 0 <= s ? ++o : --o) {
					t = t << 8 | e.charCodeAt(n);
					i += 1;
					if (i === 3) {
						w(t, i, r);
						t = i = 0
					}
				}
				if (i > 0) {
					w(t, i, r)
				}
				return r.join("")
			};
			f = function(e) {
				var t, i, n, r, o, s, u;
				o = [];
				t = 0;
				n = 0;
				for ( r = s = 0, u = e.length; 0 <= u ? s < u : s > u; r = 0 <= u ? ++s : --s) {
					i = e.charAt(r);
					if (i === "=") {
						break
					}
					t = t << 6 | g.indexOf(i);
					n += 1;
					if (n === 4) {
						p(t, n, o);
						t = n = 0
					}
				}
				if (n > 0) {
					p(t, n, o)
				}
				return o.join("")
			}
		}
	} else {
		f = function(e) {
			var t, i;
			t = new Buffer(e, "base64");
			return function() {
				var e, n, r;
				r = [];
				for ( i = e = 0, n = t.length; 0 <= n ? e < n : e > n; i = 0 <= n ? ++e : --e) {
					r.push(String.fromCharCode(t[i]))
				}
				return r
			}().join("")
		};
		_ = function(e) {
			var t, i;
			t = new Buffer( function() {
				var t, n, r;
				r = [];
				for ( i = t = 0, n = e.length; 0 <= n ? t < n : t > n; i = 0 <= n ? ++t : --t) {
					r.push(e.charCodeAt(i))
				}
				return r
			}());
			return t.toString("base64")
		}
	}
	i.Client = function() {
		function e(e) {
			this.sandbox = e.sandbox || false;
			this.apiServer = e.server || this.defaultApiServer();
			this.authServer = e.authServer || this.defaultAuthServer();
			this.fileServer = e.fileServer || this.defaultFileServer();
			this.oauth = new r(e);
			this.uid = null;
			this.authState = null;
			this.authError = null;
			this._credentials = null;
			this.setCredentials(e);
			this.setupUrls()
		}
		e.prototype.authDriver = function(e) {
			this.driver = e;
			return this
		};
		e.prototype.dropboxUid = function() {
			return this.uid
		};
		e.prototype.credentials = function() {
			if (!this._credentials) {
				this.computeCredentials()
			}
			return this._credentials
		};
		e.prototype.authenticate = function(e) {
			var t, r, o = this;
			t = null;
			r = function() {
				var s;
				if (t !== o.authState) {
					t = o.authState;
					if (o.driver.onAuthStateChange) {
						return o.driver.onAuthStateChange(o, r)
					}
				}
				switch(o.authState) {
					case n.RESET:
						return o.requestToken(function(e, t) {
							var i, s;
							if (e) {
								o.authError = e;
								o.authState = n.ERROR
							} else {
								i = t.oauth_token;
								s = t.oauth_token_secret;
								o.oauth.setToken(i, s);
								o.authState = n.REQUEST
							}
							o._credentials = null;
							return r()
						});
					case n.REQUEST:
						s = o.authorizeUrl(o.oauth.token);
						return o.driver.doAuthorize(s, o.oauth.token, o.oauth.tokenSecret, function() {
							o.authState = n.AUTHORIZED;
							o._credentials = null;
							return r()
						});
					case n.AUTHORIZED:
						return o.getAccessToken(function(e, t) {
							if (e) {
								o.authError = e;
								o.authState = n.ERROR
							} else {
								o.oauth.setToken(t.oauth_token, t.oauth_token_secret);
								o.uid = t.uid;
								o.authState = n.DONE
							}
							o._credentials = null;
							return r()
						});
					case n.DONE:
						return e(null, o);
					case i.SIGNED_OFF:
						o.reset();
						return r();
					case n.ERROR:
						return e(o.authError)
				}
			};
			r();
			return this
		};
		e.prototype.signOut = function(e) {
			var t, r, o = this;
			r = this.urls.signOut;
			t = this.oauth.addAuthParams("POST", r, {});
			return i.Xhr.request("POST", r, t, null, function(t) {
				if (t) {
					return e(t)
				}
				o.reset();
				o.authState = n.SIGNED_OFF;
				if (o.driver.onAuthStateChange) {
					return o.driver.onAuthStateChange(o, function() {
						return e(t)
					})
				} else {
					return e(t)
				}
			})
		};
		e.prototype.signOff = function(e) {
			return this.signOut(e)
		};
		e.prototype.getUserInfo = function(e) {
			var t, n;
			n = this.urls.accountInfo;
			t = this.oauth.addAuthParams("GET", n, {});
			return i.Xhr.request("GET", n, t, null, function(t, n) {
				return e(t, i.UserInfo.parse(n), n)
			})
		};
		e.prototype.readFile = function(e, t, n) {
			var r, o, s;
			if (!n && typeof t === "function") {
				n = t;
				t = null
			}
			s = "" + this.urls.getFile + "/" + this.urlEncodePath(e);
			r = {};
			o = null;
			if (t) {
				if (t.versionTag) {
					r.rev = t.versionTag
				} else if (t.rev) {
					r.rev = t.rev
				}
				if (t.blob) {
					o = "blob"
				}
				if (t.binary) {
					o = "b"
				}
			}
			this.oauth.addAuthParams("GET", s, r);
			return i.Xhr.request2("GET", s, r, null, null, o, function(e, t, r) {
				return n(e, t, i.Stat.parse(r))
			})
		};
		e.prototype.writeFile = function(e, t, n, r) {
			var o;
			if (!r && typeof n === "function") {
				r = n;
				n = null
			}
			o = i.Xhr.canSendForms && typeof t === "object";
			if (o) {
				return this.writeFileUsingForm(e, t, n, r)
			} else {
				return this.writeFileUsingPut(e, t, n, r)
			}
		};
		e.prototype.writeFileUsingForm = function(e, t, n, r) {
			var o, s, u, a, l;
			a = e.lastIndexOf("/");
			if (a === -1) {
				s = e;
				e = ""
			} else {
				s = e.substring(a);
				e = e.substring(0, a)
			}
			l = "" + this.urls.postFile + "/" + this.urlEncodePath(e);
			u = {
				file : s
			};
			if (n) {
				if (n.noOverwrite) {
					u.overwrite = "false"
				}
				if (n.lastVersionTag) {
					u.parent_rev = n.lastVersionTag
				} else if (n.parentRev || n.parent_rev) {
					u.parent_rev = n.parentRev || n.parent_rev
				}
			}
			this.oauth.addAuthParams("POST", l, u);
			delete u.file;
			o = {
				name : "file",
				value : t,
				fileName : s,
				contentType : "application/octet-stream"
			};
			return i.Xhr.multipartRequest(l, o, u, null, function(e, t) {
				return r(e, i.Stat.parse(t))
			})
		};
		e.prototype.writeFileUsingPut = function(e, t, n, r) {
			var o, s;
			s = "" + this.urls.putFile + "/" + this.urlEncodePath(e);
			o = {};
			if (n) {
				if (n.noOverwrite) {
					o.overwrite = "false"
				}
				if (n.lastVersionTag) {
					o.parent_rev = n.lastVersionTag
				} else if (n.parentRev || n.parent_rev) {
					o.parent_rev = n.parentRev || n.parent_rev
				}
			}
			this.oauth.addAuthParams("POST", s, o);
			return i.Xhr.request2("POST", s, o, null, t, null, function(e, t) {
				return r(e, i.Stat.parse(t))
			})
		};
		e.prototype.stat = function(e, t, n) {
			var r, o;
			if (!n && typeof t === "function") {
				n = t;
				t = null
			}
			o = "" + this.urls.metadata + "/" + this.urlEncodePath(e);
			r = {};
			if (t) {
				if (t.version != null) {
					r.rev = t.version
				}
				if (t.removed || t.deleted) {
					r.include_deleted = "true"
				}
				if (t.readDir) {
					r.list = "true";
					if (t.readDir !== true) {
						r.file_limit = t.readDir.toString()
					}
				}
				if (t.cacheHash) {
					r.hash = t.cacheHash
				}
			}
			r.include_deleted || (r.include_deleted = "false");
			r.list || (r.list = "false");
			this.oauth.addAuthParams("GET", o, r);
			return i.Xhr.request("GET", o, r, null, function(e, t) {
				var r, o, s;
				s = i.Stat.parse(t);
				if (t != null ? t.contents :
				void 0) {
					r = function() {
						var e, n, r, s;
						r = t.contents;
						s = [];
						for ( e = 0, n = r.length; e < n; e++) {
							o = r[e];
							s.push(i.Stat.parse(o))
						}
						return s
					}()
				} else {
					r =
					void 0
				}
				return n(e, s, r)
			})
		};
		e.prototype.readdir = function(e, t, i) {
			var n;
			if (!i && typeof t === "function") {
				i = t;
				t = null
			}
			n = {
				readDir : true
			};
			if (t) {
				if (t.limit != null) {
					n.readDir = t.limit
				}
				if (t.versionTag) {
					n.versionTag = t.versionTag
				}
			}
			return this.stat(e, n, function(e, t, n) {
				var r, o;
				if (n) {
					r = function() {
						var e, t, i;
						i = [];
						for ( e = 0, t = n.length; e < t; e++) {
							o = n[e];
							i.push(o.name)
						}
						return i
					}()
				} else {
					r = null
				}
				return i(e, r, t, n)
			})
		};
		e.prototype.metadata = function(e, t, i) {
			return this.stat(e, t, i)
		};
		e.prototype.makeUrl = function(e, t, n) {
			var r, o, s;
			if (!n && typeof t === "function") {
				n = t;
				t = null
			}
			e = this.urlEncodePath(e);
			if (t && t.download) {
				r = true;
				s = "" + this.urls.media + "/" + e
			} else {
				r = false;
				s = "" + this.urls.shares + "/" + e
			}
			if (t && (t["long"] || t.longUrl)) {
				o = {
					short_url : "false"
				}
			} else {
				o = {}
			}
			this.oauth.addAuthParams("POST", s, o);
			return i.Xhr.request("POST", s, o, null, function(e, t) {
				return n(e, i.PublicUrl.parse(t, r))
			})
		};
		e.prototype.history = function(e, t, n) {
			var r, o;
			if (!n && typeof t === "function") {
				n = t;
				t = null
			}
			o = "" + this.urls.revisions + "/" + this.urlEncodePath(e);
			r = {};
			if (t && t.limit != null) {
				r.rev_limit = t.limit
			}
			this.oauth.addAuthParams("GET", o, r);
			return i.Xhr.request("GET", o, r, null, function(e, t) {
				var r, o;
				if (t) {
					o = function() {
						var e, n, o;
						o = [];
						for ( e = 0, n = t.length; e < n; e++) {
							r = t[e];
							o.push(i.Stat.parse(r))
						}
						return o
					}()
				} else {
					o =
					void 0
				}
				return n(e, o)
			})
		};
		e.prototype.revisions = function(e, t, i) {
			return this.history(e, t, i)
		};
		e.prototype.thumbnailUrl = function(e, t) {
			var n, r;
			r = "" + this.urls.thumbnails + "/" + this.urlEncodePath(e);
			n = {};
			if (t) {
				if (t.format) {
					n.format = t.format
				} else if (t.png) {
					n.format = "png"
				}
				if (t.size) {
					n.size = t.size
				}
			}
			this.oauth.addAuthParams("GET", r, n);
			return "" + r + "?" + i.Xhr.urlEncode(n)
		};
		e.prototype.readThumbnail = function(e, t, n) {
			var r, o;
			if (!n && typeof t === "function") {
				n = t;
				t = null
			}
			o = this.thumbnailUrl(e, t);
			r = "b";
			if (t) {
				if (t.blob) {
					r = "blob"
				}
			}
			return i.Xhr.request2("GET", o, {}, null, null, r, function(e, t, r) {
				return n(e, t, i.Stat.parse(r))
			})
		};
		e.prototype.revertFile = function(e, t, n) {
			var r, o;
			o = "" + this.urls.restore + "/" + this.urlEncodePath(e);
			r = {
				rev : t
			};
			this.oauth.addAuthParams("POST", o, r);
			return i.Xhr.request("POST", o, r, null, function(e, t) {
				return n(e, i.Stat.parse(t))
			})
		};
		e.prototype.restore = function(e, t, i) {
			return this.revertFile(e, t, i)
		};
		e.prototype.findByName = function(e, t, n, r) {
			var o, s;
			if (!r && typeof n === "function") {
				r = n;
				n = null
			}
			s = "" + this.urls.search + "/" + this.urlEncodePath(e);
			o = {
				query : t
			};
			if (n) {
				if (n.limit != null) {
					o.file_limit = n.limit
				}
				if (n.removed || n.deleted) {
					o.include_deleted = true
				}
			}
			this.oauth.addAuthParams("GET", s, o);
			return i.Xhr.request("GET", s, o, null, function(e, t) {
				var n, o;
				if (t) {
					o = function() {
						var e, r, o;
						o = [];
						for ( e = 0, r = t.length; e < r; e++) {
							n = t[e];
							o.push(i.Stat.parse(n))
						}
						return o
					}()
				} else {
					o =
					void 0
				}
				return r(e, o)
			})
		};
		e.prototype.search = function(e, t, i, n) {
			return this.findByName(e, t, i, n)
		};
		e.prototype.makeCopyReference = function(e, t) {
			var n, r;
			r = "" + this.urls.copyRef + "/" + this.urlEncodePath(e);
			n = this.oauth.addAuthParams("GET", r, {});
			return i.Xhr.request("GET", r, n, null, function(e, n) {
				return t(e, i.CopyReference.parse(n))
			})
		};
		e.prototype.copyRef = function(e, t) {
			return this.makeCopyReference(e, t)
		};
		e.prototype.pullChanges = function(e, t) {
			var n, r;
			if (!t && typeof e === "function") {
				t = e;
				e = null
			}
			r = this.urls.delta;
			n = {};
			if (e) {
				if (e.cursorTag) {
					n = {
						cursor : e.cursorTag
					}
				} else {
					n = {
						cursor : e
					}
				}
			} else {
				n = {}
			}
			this.oauth.addAuthParams("POST", r, n);
			return i.Xhr.request("POST", r, n, null, function(e, n) {
				return t(e, i.PulledChanges.parse(n))
			})
		};
		e.prototype.delta = function(e, t) {
			return this.pullChanges(e, t)
		};
		e.prototype.mkdir = function(e, t) {
			var n, r;
			r = this.urls.fileopsCreateFolder;
			n = {
				root : this.fileRoot,
				path : this.normalizePath(e)
			};
			this.oauth.addAuthParams("POST", r, n);
			return i.Xhr.request("POST", r, n, null, function(e, n) {
				return t(e, i.Stat.parse(n))
			})
		};
		e.prototype.remove = function(e, t) {
			var n, r;
			r = this.urls.fileopsDelete;
			n = {
				root : this.fileRoot,
				path : this.normalizePath(e)
			};
			this.oauth.addAuthParams("POST", r, n);
			return i.Xhr.request("POST", r, n, null, function(e, n) {
				return t(e, i.Stat.parse(n))
			})
		};
		e.prototype.unlink = function(e, t) {
			return this.remove(e, t)
		};
		e.prototype["delete"] = function(e, t) {
			return this.remove(e, t)
		};
		e.prototype.copy = function(e, t, n) {
			var r, o, s;
			if (!n && typeof r === "function") {
				n = r;
				r = null
			}
			o = {
				root : this.fileRoot,
				to_path : this.normalizePath(t)
			};
			if ( e instanceof i.CopyReference) {
				o.from_copy_ref = e.tag
			} else {
				o.from_path = this.normalizePath(e)
			}
			s = this.urls.fileopsCopy;
			this.oauth.addAuthParams("POST", s, o);
			return i.Xhr.request("POST", s, o, null, function(e, t) {
				return n(e, i.Stat.parse(t))
			})
		};
		e.prototype.move = function(e, t, n) {
			var r, o, s;
			if (!n && typeof r === "function") {
				n = r;
				r = null
			}
			e = this.normalizePath(e);
			t = this.normalizePath(t);
			s = this.urls.fileopsMove;
			o = {
				root : this.fileRoot,
				from_path : e,
				to_path : t
			};
			this.oauth.addAuthParams("POST", s, o);
			return i.Xhr.request("POST", s, o, null, function(e, t) {
				return n(e, i.Stat.parse(t))
			})
		};
		e.prototype.reset = function() {
			this.uid = null;
			this.oauth.setToken(null, "");
			this.authState = n.RESET;
			this.authError = null;
			this._credentials = null;
			return this
		};
		e.prototype.setCredentials = function(e) {
			this.oauth.reset(e);
			this.uid = e.uid || null;
			if (e.authState) {
				this.authState = e.authState
			} else {
				if (e.token) {
					this.authState = n.DONE
				} else {
					this.authState = n.RESET
				}
			}
			this.authError = null;
			this._credentials = null;
			return this
		};
		e.prototype.appHash = function() {
			return this.oauth.appHash()
		};
		e.prototype.setupUrls = function() {
			this.fileRoot = this.sandbox ? "sandbox" : "dropbox";
			return this.urls = {
				requestToken : "" + this.apiServer + "/1/oauth/request_token",
				authorize : "" + this.authServer + "/1/oauth/authorize",
				accessToken : "" + this.apiServer + "/1/oauth/access_token",
				signOut : "" + this.apiServer + "/1/unlink_access_token",
				accountInfo : "" + this.apiServer + "/1/account/info",
				getFile : "" + this.fileServer + "/1/files/" + this.fileRoot,
				postFile : "" + this.fileServer + "/1/files/" + this.fileRoot,
				putFile : "" + this.fileServer + "/1/files_put/" + this.fileRoot,
				metadata : "" + this.apiServer + "/1/metadata/" + this.fileRoot,
				delta : "" + this.apiServer + "/1/delta",
				revisions : "" + this.apiServer + "/1/revisions/" + this.fileRoot,
				restore : "" + this.apiServer + "/1/restore/" + this.fileRoot,
				search : "" + this.apiServer + "/1/search/" + this.fileRoot,
				shares : "" + this.apiServer + "/1/shares/" + this.fileRoot,
				media : "" + this.apiServer + "/1/media/" + this.fileRoot,
				copyRef : "" + this.apiServer + "/1/copy_ref/" + this.fileRoot,
				thumbnails : "" + this.fileServer + "/1/thumbnails/" + this.fileRoot,
				fileopsCopy : "" + this.apiServer + "/1/fileops/copy",
				fileopsCreateFolder : "" + this.apiServer + "/1/fileops/create_folder",
				fileopsDelete : "" + this.apiServer + "/1/fileops/delete",
				fileopsMove : "" + this.apiServer + "/1/fileops/move"
			}
		};
		e.ERROR = 0;
		e.RESET = 1;
		e.REQUEST = 2;
		e.AUTHORIZED = 3;
		e.DONE = 4;
		e.SIGNED_OFF = 5;
		e.prototype.urlEncodePath = function(e) {
			return i.Xhr.urlEncodeValue(this.normalizePath(e)).replace(/%2F/gi, "/")
		};
		e.prototype.normalizePath = function(e) {
			var t;
			if (e.substring(0, 1) === "/") {
				t = 1;
				while (e.substring(t, t + 1) === "/") {
					t += 1
				}
				return e.substring(t)
			} else {
				return e
			}
		};
		e.prototype.requestToken = function(e) {
			var t;
			t = this.oauth.addAuthParams("POST", this.urls.requestToken, {});
			return i.Xhr.request("POST", this.urls.requestToken, t, null, e)
		};
		e.prototype.authorizeUrl = function(e) {
			var t;
			t = {
				oauth_token : e,
				oauth_callback : this.driver.url()
			};
			return "" + this.urls.authorize + "?" + i.Xhr.urlEncode(t)
		};
		e.prototype.getAccessToken = function(e) {
			var t;
			t = this.oauth.addAuthParams("POST", this.urls.accessToken, {});
			return i.Xhr.request("POST", this.urls.accessToken, t, null, e)
		};
		e.prototype.defaultApiServer = function() {
			return "https://api.dropbox.com"
		};
		e.prototype.defaultAuthServer = function() {
			return this.apiServer.replace("api.", "www.")
		};
		e.prototype.defaultFileServer = function() {
			return this.apiServer.replace("api.", "api-content.")
		};
		e.prototype.computeCredentials = function() {
			var e;
			e = {
				key : this.oauth.key,
				sandbox : this.sandbox
			};
			if (this.oauth.secret) {
				e.secret = this.oauth.secret
			}
			if (this.oauth.token) {
				e.token = this.oauth.token;
				e.tokenSecret = this.oauth.tokenSecret
			}
			if (this.uid) {
				e.uid = this.uid
			}
			if (this.authState !== n.ERROR && this.authState !== n.RESET && this.authState !== n.DONE && this.authState !== n.SIGNED_OFF) {
				e.authState = this.authState
			}
			if (this.apiServer !== this.defaultApiServer()) {
				e.server = this.apiServer
			}
			if (this.authServer !== this.defaultAuthServer()) {
				e.authServer = this.authServer
			}
			if (this.fileServer !== this.defaultFileServer()) {
				e.fileServer = this.fileServer
			}
			return this._credentials = e
		};
		return e
	}();
	n = i.Client;
	i.AuthDriver = function() {
		function e() {
		}
		e.prototype.url = function() {
			return "https://some.url"
		};
		e.prototype.doAuthorize = function(e, t, i, n) {
			return n("oauth-token")
		};
		e.prototype.onAuthStateChange = function(e, t) {
			return t()
		};
		return e
	}();
	i.Drivers = {};
	i.Drivers.Redirect = function() {
		function e(e) {
			this.rememberUser = (e != null ? e.rememberUser :
			void 0) || false;
			this.scope = (e != null ? e.scope :
			void 0) || "default";
			this.useQuery = (e != null ? e.useQuery :
			void 0) || false;
			this.receiverUrl = this.computeUrl(e);
			this.tokenRe = new RegExp("(#|\\?|&)oauth_token=([^&#]+)(&|#|$)")
		}
		e.prototype.url = function() {
			return this.receiverUrl
		};
		e.prototype.doAuthorize = function(e) {
			return window.location.assign(e)
		};
		e.prototype.onAuthStateChange = function(e, t) {
			var i, r = this;
			this.storageKey = "dropbox-auth:" + this.scope + ":" + e.appHash();
			switch(e.authState) {
				case n.RESET:
					if (!( i = this.loadCredentials())) {
						return t()
					}
					if (i.authState) {
						if (i.token === this.locationToken()) {
							if (i.authState === n.REQUEST) {
								this.forgetCredentials();
								i.authState = n.AUTHORIZED
							}
							e.setCredentials(i)
						}
						return t()
					}
					if (!this.rememberUser) {
						this.forgetCredentials();
						return t()
					}
					e.setCredentials(i);
					return e.getUserInfo(function(i) {
						if (i) {
							e.reset();
							r.forgetCredentials()
						}
						return t()
					});
				case n.REQUEST:
					this.storeCredentials(e.credentials());
					return t();
				case n.DONE:
					if (this.rememberUser) {
						this.storeCredentials(e.credentials())
					}
					return t();
				case n.SIGNED_OFF:
					this.forgetCredentials();
					return t();
				case n.ERROR:
					this.forgetCredentials();
					return t();
				default:
					return t()
			}
		};
		e.prototype.computeUrl = function() {
			var e, t, n, r;
			r = "_dropboxjs_scope=" + encodeURIComponent(this.scope);
			t = i.Drivers.Redirect.currentLocation();
			if (t.indexOf("#") === -1) {
				e = null
			} else {
				n = t.split("#", 2);
				t = n[0];
				e = n[1]
			}
			if (this.useQuery) {
				if (t.indexOf("?") === -1) {
					t += "?" + r
				} else {
					t += "&" + r
				}
			} else {
				e = "?" + r
			}
			if (e) {
				return t + "#" + e
			} else {
				return t
			}
		};
		e.prototype.locationToken = function() {
			var e, t, n;
			e = i.Drivers.Redirect.currentLocation();
			n = "_dropboxjs_scope=" + encodeURIComponent(this.scope) + "&";
			if (( typeof e.indexOf === "function" ? e.indexOf(n) :
			void 0) === -1) {
				return null
			}
			t = this.tokenRe.exec(e);
			if (t) {
				return decodeURIComponent(t[2])
			} else {
				return null
			}
		};
		e.currentLocation = function() {
			return window.location.href
		};
		e.prototype.storeCredentials = function(e) {
			return localStorage.setItem(this.storageKey, JSON.stringify(e))
		};
		e.prototype.loadCredentials = function() {
			var e;
			e = localStorage.getItem(this.storageKey);
			if (!e) {
				return null
			}
			try {
				return JSON.parse(e)
			} catch(t) {
				return null
			}
		};
		e.prototype.forgetCredentials = function() {
			return localStorage.removeItem(this.storageKey)
		};
		return e
	}();
	i.Drivers.Popup = function() {
		function e(e) {
			this.receiverUrl = this.computeUrl(e);
			this.tokenRe = new RegExp("(#|\\?|&)oauth_token=([^&#]+)(&|#|$)")
		}
		e.prototype.doAuthorize = function(e, t, i, n) {
			this.listenForMessage(t, n);
			return this.openWindow(e)
		};
		e.prototype.url = function() {
			return this.receiverUrl
		};
		e.prototype.computeUrl = function(e) {
			var t;
			if (e) {
				if (e.receiverUrl) {
					if (e.noFragment || e.receiverUrl.indexOf("#") !== -1) {
						return e.receiverUrl
					} else {
						return e.receiverUrl + "#"
					}
				} else if (e.receiverFile) {
					t = i.Drivers.Popup.currentLocation().split("/");
					t[t.length - 1] = e.receiverFile;
					if (e.noFragment) {
						return t.join("/")
					} else {
						return t.join("/") + "#"
					}
				}
			}
			return i.Drivers.Popup.currentLocation()
		};
		e.currentLocation = function() {
			return window.location.href
		};
		e.prototype.openWindow = function(e) {
			return window.open(e, "_dropboxOauthSigninWindow", this.popupWindowSpec(980, 980))
		};
		e.prototype.popupWindowSpec = function(e, t) {
			var i, n, r, o, s, u, a, l, c, h;
			s = ( a = window.screenX) != null ? a : window.screenLeft;
			u = ( l = window.screenY) != null ? l : window.screenTop;
			o = ( c = window.outerWidth) != null ? c : document.documentElement.clientWidth;
			i = ( h = window.outerHeight) != null ? h : document.documentElement.clientHeight;
			n = Math.round(s + (o - e) / 2);
			r = Math.round(u + (i - t) / 2.5);
			return "width=" + e + ",height=" + t + "," + ("left=" + n + ",top=" + r) + "dialog=yes,dependent=yes,scrollbars=yes,location=yes"
		};
		e.prototype.listenForMessage = function(e, t) {
			var i, n;
			n = this.tokenRe;
			i = function(r) {
				var o;
				o = n.exec(r.data.toString());
				if (o && decodeURIComponent(o[2]) === e) {
					window.removeEventListener("message", i);
					return t()
				}
			};
			return window.addEventListener("message", i, false)
		};
		return e
	}();
	i.Drivers.NodeServer = function() {
		function e(e) {
			this.port = (e != null ? e.port :
			void 0) || 8912;
			this.faviconFile = (e != null ? e.favicon :
			void 0) || null;
			this.fs = require("fs");
			this.http = require("http");
			this.open = require("open");
			this.callbacks = {};
			this.urlRe = new RegExp("^/oauth_callback\\?");
			this.tokenRe = new RegExp("(\\?|&)oauth_token=([^&]+)(&|$)");
			this.createApp()
		}
		e.prototype.url = function() {
			return "http://localhost:" + this.port + "/oauth_callback"
		};
		e.prototype.doAuthorize = function(e, t, i, n) {
			this.callbacks[t] = n;
			return this.openBrowser(e)
		};
		e.prototype.openBrowser = function(e) {
			if (!e.match(/^https?:\/\//)) {
				throw new Error("Not a http/https URL: " + e)
			}
			return this.open(e)
		};
		e.prototype.createApp = function() {
			var e = this;
			this.app = this.http.createServer(function(t, i) {
				return e.doRequest(t, i)
			});
			return this.app.listen(this.port)
		};
		e.prototype.closeServer = function() {
			return this.app.close()
		};
		e.prototype.doRequest = function(e, t) {
			var i, n, r, o = this;
			if (this.urlRe.exec(e.url)) {
				n = this.tokenRe.exec(e.url);
				if (n) {
					r = decodeURIComponent(n[2]);
					if (this.callbacks[r]) {
						this.callbacks[r]();
						delete this.callbacks[r]
					}
				}
			}
			i = "";
			e.on("data", function(e) {
				return i += e
			});
			return e.on("end", function() {
				if (o.faviconFile && e.url === "/favicon.ico") {
					return o.sendFavicon(t)
				} else {
					return o.closeBrowser(t)
				}
			})
		};
		e.prototype.closeBrowser = function(e) {
			var t;
			t = '<!doctype html>\n<script type="text/javascript">window.close();</script>\n<p>Please close this window.</p>';
			e.writeHead(200, {
				"Content-Length" : t.length,
				"Content-Type" : "text/html"
			});
			e.write(t);
			return e.end
		};
		e.prototype.sendFavicon = function(e) {
			return this.fs.readFile(this.faviconFile, function(t, i) {
				e.writeHead(200, {
					"Content-Length" : i.length,
					"Content-Type" : "image/x-icon"
				});
				e.write(i);
				return e.end
			})
		};
		return e
	}();
	m = function(e, t) {
		return d(x(T(e), T(t), e.length, t.length))
	};
	y = function(e) {
		return d(N(T(e), e.length))
	};
	if ( typeof window === "undefined" || window === null) {
		v = require("crypto");
		m = function(e, t) {
			var i;
			i = v.createHmac("sha1", t);
			i.update(e);
			return i.digest("base64")
		};
		y = function(e) {
			var t;
			t = v.createHash("sha1");
			t.update(e);
			return t.digest("base64")
		}
	}
	x = function(e, t, i, n) {
		var r, o, s, u;
		if (t.length > 16) {
			t = N(t, n)
		}
		s = function() {
			var e, i;
			i = [];
			for ( o = e = 0; e < 16; o = ++e) {
				i.push(t[o] ^ 909522486)
			}
			return i
		}();
		u = function() {
			var e, i;
			i = [];
			for ( o = e = 0; e < 16; o = ++e) {
				i.push(t[o] ^ 1549556828)
			}
			return i
		}();
		r = N(s.concat(e), 64 + i);
		return N(u.concat(r), 64 + 20)
	};
	N = function(e, t) {
		var i, n, r, o, s, u, a, l, c, d, f, p, g, m, y, _, w, v;
		e[t >> 2] |= 1 << 31 - ((t & 3) << 3);
		e[(t + 8 >> 6 << 4) + 15] = t << 3;
		_ = Array(80);
		i = 1732584193;
		r = -271733879;
		s = -1732584194;
		a = 271733878;
		c = -1009589776;
		p = 0;
		y = e.length;
		while (p < y) {
			n = i;
			o = r;
			u = s;
			l = a;
			d = c;
			for ( g = v = 0; v < 80; g = ++v) {
				if (g < 16) {
					_[g] = e[p + g]
				} else {
					_[g] = C(_[g - 3] ^ _[g - 8] ^ _[g - 14] ^ _[g - 16], 1)
				}
				if (g < 20) {
					f = r & s | ~r & a;
					m = 1518500249
				} else if (g < 40) {
					f = r ^ s ^ a;
					m = 1859775393
				} else if (g < 60) {
					f = r & s | r & a | s & a;
					m = -1894007588
				} else {
					f = r ^ s ^ a;
					m = -899497514
				}
				w = h(h(C(i, 5), f), h(h(c, _[g]), m));
				c = a;
				a = s;
				s = C(r, 30);
				r = i;
				i = w
			}
			i = h(i, n);
			r = h(r, o);
			s = h(s, u);
			a = h(a, l);
			c = h(c, d);
			p += 16
		}
		return [i, r, s, a, c]
	};
	C = function(e, t) {
		return e << t | e >>> 32 - t
	};
	h = function(e, t) {
		var i, n;
		n = (e & 65535) + (t & 65535);
		i = (e >> 16) + (t >> 16) + (n >> 16);
		return i << 16 | n & 65535
	};
	d = function(e) {
		var t, i, n, r, o;
		r = "";
		t = 0;
		n = e.length * 4;
		while (t < n) {
			i = t;
			o = (e[i >> 2] >> (3 - (i & 3) << 3) & 255) << 16;
			i += 1;
			o |= (e[i >> 2] >> (3 - (i & 3) << 3) & 255) << 8;
			i += 1;
			o |= e[i >> 2] >> (3 - (i & 3) << 3) & 255;
			r += D[o >> 18 & 63];
			r += D[o >> 12 & 63];
			t += 1;
			if (t >= n) {
				r += "="
			} else {
				r += D[o >> 6 & 63]
			}
			t += 1;
			if (t >= n) {
				r += "="
			} else {
				r += D[o & 63]
			}
			t += 1
		}
		return r
	};
	D = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	T = function(e) {
		var t, i, n, r, o;
		t = [];
		n = 255;
		for ( i = r = 0, o = e.length; 0 <= o ? r < o : r > o; i = 0 <= o ? ++r : --r) {
			t[i >> 2] |= (e.charCodeAt(i) & n) << (3 - (i & 3) << 3)
		}
		return t
	};
	i.Oauth = function() {
		function e(e) {
			this.key = this.k = null;
			this.secret = this.s = null;
			this.token = null;
			this.tokenSecret = null;
			this._appHash = null;
			this.reset(e)
		}
		e.prototype.reset = function(e) {
			var t, i, n, r;
			if (e.secret) {
				this.k = this.key = e.key;
				this.s = this.secret = e.secret;
				this._appHash = null
			} else if (e.key) {
				this.key = e.key;
				this.secret = null;
				n = f(b(this.key).split("|",2)[1]);
				r = n.split("?", 2), t = r[0], i = r[1];
				this.k = decodeURIComponent(t);
				this.s = decodeURIComponent(i);
				this._appHash = null
			} else {
				if (!this.k) {
					throw new Error("No API key supplied")
				}
			}
			if (e.token) {
				return this.setToken(e.token, e.tokenSecret)
			} else {
				return this.setToken(null, "")
			}
		};
		e.prototype.setToken = function(e, t) {
			if (e && !t) {
				throw new Error("No secret supplied with the user token")
			}
			this.token = e;
			this.tokenSecret = t || "";
			this.hmacKey = o.urlEncodeValue(this.s) + "&" + o.urlEncodeValue(t);
			return null
		};
		e.prototype.authHeader = function(e, t, i) {
			var n, r, s, u, a, l;
			this.addAuthParams(e, t, i);
			r = [];
			for (s in i) {
				u = i[s];
				if (s.substring(0, 6) === "oauth_") {
					r.push(s)
				}
			}
			r.sort();
			n = [];
			for ( a = 0, l = r.length; a < l; a++) {
				s = r[a];
				n.push(o.urlEncodeValue(s) + '="' + o.urlEncodeValue(i[s]) + '"');
				delete i[s]
			}
			return "OAuth " + n.join(",")
		};
		e.prototype.addAuthParams = function(e, t, i) {
			this.boilerplateParams(i);
			i.oauth_signature = this.signature(e, t, i);
			return i
		};
		e.prototype.boilerplateParams = function(e) {
			e.oauth_consumer_key = this.k;
			e.oauth_nonce = this.nonce();
			e.oauth_signature_method = "HMAC-SHA1";
			if (this.token) {
				e.oauth_token = this.token
			}
			e.oauth_timestamp = Math.floor(Date.now() / 1e3);
			e.oauth_version = "1.0";
			return e
		};
		e.prototype.nonce = function() {
			return Date.now().toString(36) + Math.random().toString(36)
		};
		e.prototype.signature = function(e, t, i) {
			var n;
			n = e.toUpperCase() + "&" + o.urlEncodeValue(t) + "&" + o.urlEncodeValue(o.urlEncode(i));
			return m(n, this.hmacKey)
		};
		e.prototype.appHash = function() {
			if (this._appHash) {
				return this._appHash
			}
			return this._appHash = y(this.k).replace(/\=/g, "")
		};
		return e
	}();
	if (Date.now == null) {
		Date.now = function() {
			return (new Date).getTime()
		}
	}
	r = i.Oauth;
	b = function(e, t) {
		var i, n, r, o, s, u, a, l, c, h, d, p;
		if (t) {
			t = [encodeURIComponent(e), encodeURIComponent(t)].join("?");
			e = function() {
				var t, n, r;
				r = [];
				for ( i = t = 0, n = e.length / 2; 0 <= n ? t < n : t > n; i = 0 <= n ? ++t : --t) {
					r.push((e.charCodeAt(i * 2) & 15) * 16 + (e.charCodeAt(i * 2 + 1) & 15))
				}
				return r
			}()
		} else {
			h = e.split("|", 2), e = h[0], t = h[1];
			e = f(e);
			e = function() {
				var t, n, r;
				r = [];
				for ( i = t = 0, n = e.length; 0 <= n ? t < n : t > n; i = 0 <= n ? ++t : --t) {
					r.push(e.charCodeAt(i))
				}
				return r
			}();
			t = f(t)
		}
		o = function() {
			p = [];
			for ( l = 0; l < 256; l++) {
				p.push(l)
			}
			return p
		}.apply(this);
		u = 0;
		for ( s = c = 0; c < 256; s = ++c) {
			u = (u + o[i] + e[s % e.length]) % 256;
			d = [o[u], o[s]], o[s] = d[0], o[u] = d[1]
		}
		s = u = 0;
		r = function() {
			var e, i, r, l;
			l = [];
			for ( a = e = 0, i = t.length; 0 <= i ? e < i : e > i; a = 0 <= i ? ++e : --e) {
				s = (s + 1) % 256;
				u = (u + o[s]) % 256;
				r = [o[u], o[s]], o[s] = r[0], o[u] = r[1];
				n = o[(o[s] + o[u]) % 256];
				l.push(String.fromCharCode((n ^ t.charCodeAt(a)) % 256))
			}
			return l
		}();
		e = function() {
			var t, n, r;
			r = [];
			for ( i = t = 0, n = e.length; 0 <= n ? t < n : t > n; i = 0 <= n ? ++t : --t) {
				r.push(String.fromCharCode(e[i]))
			}
			return r
		}();
		return [_(e.join("")), _(r.join(""))].join("|")
	};
	i.PulledChanges = function() {
		e.parse = function(e) {
			if (e && typeof e === "object") {
				return new i.PulledChanges(e)
			} else {
				return e
			}
		};
		e.prototype.blankSlate =
		void 0;
		e.prototype.cursorTag =
		void 0;
		e.prototype.changes =
		void 0;
		e.prototype.shouldPullAgain =
		void 0;
		e.prototype.shouldBackOff =
		void 0;
		function e(e) {
			var t;
			this.blankSlate = e.reset || false;
			this.cursorTag = e.cursor;
			this.shouldPullAgain = e.has_more;
			this.shouldBackOff = !this.shouldPullAgain;
			if (e.cursor && e.cursor.length) {
				this.changes = function() {
					var n, r, o, s;
					o = e.entries;
					s = [];
					for ( n = 0, r = o.length; n < r; n++) {
						t = o[n];
						s.push(i.PullChange.parse(t))
					}
					return s
				}()
			} else {
				this.changes = []
			}
		}
		return e
	}();
	i.PullChange = function() {
		e.parse = function(e) {
			if (e && typeof e === "object") {
				return new i.PullChange(e)
			} else {
				return e
			}
		};
		e.prototype.path =
		void 0;
		e.prototype.wasRemoved =
		void 0;
		e.prototype.stat =
		void 0;
		function e(e) {
			this.path = e[0];
			this.stat = i.Stat.parse(e[1]);
			if (this.stat) {
				this.wasRemoved = false
			} else {
				this.stat = null;
				this.wasRemoved = true
			}
		}
		return e
	}();
	i.PublicUrl = function() {
		e.parse = function(e, t) {
			if (e && typeof e === "object") {
				return new i.PublicUrl(e, t)
			} else {
				return e
			}
		};
		e.prototype.url =
		void 0;
		e.prototype.expiresAt =
		void 0;
		e.prototype.isDirect =
		void 0;
		e.prototype.isPreview =
		void 0;
		function e(e, t) {
			this.url = e.url;
			this.expiresAt = new Date(Date.parse(e.expires));
			if (t === true) {
				this.isDirect = true
			} else if (t === false) {
				this.isDirect = false
			} else {
				this.isDirect = Date.now() - this.expiresAt <= 864e5
			}
			this.isPreview = !this.isDirect
		}
		return e
	}();
	i.CopyReference = function() {
		e.parse = function(e) {
			if (e && ( typeof e === "object" || typeof e === "string")) {
				return new i.CopyReference(e)
			} else {
				return e
			}
		};
		e.prototype.tag =
		void 0;
		e.prototype.expiresAt =
		void 0;
		function e(e) {
			if ( typeof e === "object") {
				this.tag = e.copy_ref;
				this.expiresAt = new Date(Date.parse(e.expires))
			} else {
				this.tag = e;
				this.expiresAt = new Date
			}
		}
		return e
	}();
	i.Stat = function() {
		e.parse = function(e) {
			if (e && typeof e === "object") {
				return new i.Stat(e)
			} else {
				return e
			}
		};
		e.prototype.path = null;
		e.prototype.name = null;
		e.prototype.inAppFolder = null;
		e.prototype.isFolder = null;
		e.prototype.isFile = null;
		e.prototype.isRemoved = null;
		e.prototype.typeIcon = null;
		e.prototype.versionTag = null;
		e.prototype.mimeType = null;
		e.prototype.size = null;
		e.prototype.humanSize = null;
		e.prototype.hasThumbnail = null;
		e.prototype.modifiedAt = null;
		e.prototype.clientModifiedAt = null;
		function e(e) {
			var t, i, n, r;
			this.path = e.path;
			if (this.path.substring(0, 1) !== "/") {
				this.path = "/" + this.path
			}
			t = this.path.length - 1;
			if (t >= 0 && this.path.substring(t) === "/") {
				this.path = this.path.substring(0, t)
			}
			i = this.path.lastIndexOf("/");
			this.name = this.path.substring(i + 1);
			this.isFolder = e.is_dir || false;
			this.isFile = !this.isFolder;
			this.isRemoved = e.is_deleted || false;
			this.typeIcon = e.icon;
			if (( n = e.modified) != null ? n.length :
			void 0) {
				this.modifiedAt = new Date(Date.parse(e.modified))
			} else {
				this.modifiedAt = null
			}
			if (( r = e.client_mtime) != null ? r.length :
			void 0) {
				this.clientModifiedAt = new Date(Date.parse(e.client_mtime))
			} else {
				this.clientModifiedAt = null
			}
			switch(e.root) {
				case"dropbox":
					this.inAppFolder = false;
					break;
				case"app_folder":
					this.inAppFolder = true;
					break;
				default:
					this.inAppFolder = null
			}
			this.size = e.bytes || 0;
			this.humanSize = e.size || "";
			this.hasThumbnail = e.thumb_exists || false;
			if (this.isFolder) {
				this.versionTag = e.hash;
				this.mimeType = e.mime_type || "inode/directory"
			} else {
				this.versionTag = e.rev;
				this.mimeType = e.mime_type || "application/octet-stream"
			}
		}
		return e
	}();
	i.UserInfo = function() {
		e.parse = function(e) {
			if (e && typeof e === "object") {
				return new i.UserInfo(e)
			} else {
				return e
			}
		};
		e.prototype.name = null;
		e.prototype.email = null;
		e.prototype.countryCode = null;
		e.prototype.uid = null;
		e.prototype.referralUrl = null;
		e.prototype.publicAppUrl = null;
		e.prototype.quota = null;
		e.prototype.usedQuota = null;
		e.prototype.privateBytes = null;
		e.prototype.sharedBytes = null;
		function e(e) {
			var t;
			this.name = e.display_name;
			this.email = e.email;
			this.countryCode = e.country || null;
			this.uid = e.uid.toString();
			if (e.public_app_url) {
				this.publicAppUrl = e.public_app_url;
				t = this.publicAppUrl.length - 1;
				if (t >= 0 && this.publicAppUrl.substring(t) === "/") {
					this.publicAppUrl = this.publicAppUrl.substring(0, t)
				}
			} else {
				this.publicAppUrl = null
			}
			this.referralUrl = e.referral_link;
			this.quota = e.quota_info.quota;
			this.privateBytes = e.quota_info.normal || 0;
			this.sharedBytes = e.quota_info.shared || 0;
			this.usedQuota = this.privateBytes + this.sharedBytes
		}
		return e
	}();
	if ( typeof window !== "undefined" && window !== null) {
		if (window.XDomainRequest && !("withCredentials" in new XMLHttpRequest)) {
			a = window.XDomainRequest;
			u = true;
			s = false
		} else {
			a = window.XMLHttpRequest;
			u = false;
			s = window.navigator.userAgent.indexOf("Firefox") === -1
		}
	} else {
		a = require("xmlhttprequest").XMLHttpRequest;
		u = false;
		s = false
	}
	i.Xhr = function() {
		function e() {
		}
		e.Request = a;
		e.ieMode = u;
		e.canSendForms = s;
		e.request = function(e, t, i, n, r) {
			return this.request2(e, t, i, n, null, null, r)
		};
		e.request2 = function(e, t, i, n, r, s, u) {
			var a, l, c;
			l = e === "GET" || r != null || this.ieMode;
			if (l) {
				c = o.urlEncode(i);
				if (c.length !== 0) {
					t = [t, "?", o.urlEncode(i)].join("")
				}
			}
			a = {};
			if (n) {
				a["Authorization"] = n
			}
			if (r != null) {
				if ( typeof r === "string") {
					a["Content-Type"] = "text/plain; charset=utf8"
				}
			} else if (!l) {
				a["Content-Type"] = "application/x-www-form-urlencoded";
				r = o.urlEncode(i)
			}
			return o.xhrRequest(e, t, a, r, s, u)
		};
		e.multipartRequest = function(e, t, i, n, r) {
			var s, u, a, l, c, h;
			e = [e, "?", o.urlEncode(i)].join("");
			a = t.value;
			h = typeof a === "object" && ( typeof Blob !== "undefined" && Blob !== null && t.value instanceof Blob || typeof File !== "undefined" && File !== null && t.value instanceof File);
			if (h) {
				c = {};
				s = new FormData;
				s.append(t.name, a, t.fileName)
			} else {
				l = t.contentType || "application/octet-stream";
				u = this.multipartBoundary();
				c = {
					"Content-Type" : "multipart/form-data; boundary=" + u
				};
				s = ["--", u, "\r\n", 'Content-Disposition: form-data; name="', t.name, '"; filename="', t.fileName, '"\r\n', "Content-Type: ", l, "\r\n", "Content-Transfer-Encoding: binary\r\n\r\n", a, "\r\n", "--", u, "--", "\r\n"].join("")
			}
			if (n) {
				c["Authorization"] = n
			}
			return o.xhrRequest("POST", e, c, s, null, r)
		};
		e.multipartBoundary = function() {
			return [Date.now().toString(36), Math.random().toString(36)].join("----")
		};
		e.xhrRequest = function(e, t, i, n, r, s) {
			var u, a, l;
			l = new this.Request;
			if (this.ieMode) {
				l.onload = function() {
					return o.onLoad(l, e, t, s)
				};
				l.onerror = function() {
					return o.onError(l, e, t, s)
				}
			} else {
				l.onreadystatechange = function() {
					return o.onReadyStateChange(l, e, t, r, s)
				}
			}
			l.open(e, t, true);
			if (r) {
				if (r === "b") {
					if (l.overrideMimeType) {
						l.overrideMimeType("text/plain; charset=x-user-defined")
					}
				} else {
					l.responseType = r
				}
			}
			if (!this.ieMode) {
				for (u in i) {
					if (!R.call(i, u))
						continue;
					a = i[u];
					l.setRequestHeader(u, a)
				}
			}
			if (n != null) {
				l.send(n)
			} else {
				l.send()
			}
			return l
		};
		e.urlEncode = function(e) {
			var t, i, n;
			t = [];
			for (i in e) {
				n = e[i];
				t.push(this.urlEncodeValue(i) + "=" + this.urlEncodeValue(n))
			}
			return t.sort().join("&")
		};
		e.urlEncodeValue = function(e) {
			return encodeURIComponent(e.toString()).replace(/\!/g, "%21").replace(/'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/\*/g, "%2A")
		};
		e.urlDecode = function(e) {
			var t, i, n, r, o, s;
			i = {};
			s = e.split("&");
			for ( r = 0, o = s.length; r < o; r++) {
				n = s[r];
				t = n.split("=");
				i[decodeURIComponent(t[0])] = decodeURIComponent(t[1])
			}
			return i
		};
		e.onReadyStateChange = function(e, t, n, r, s) {
			var u, a, l, c, h, d, f, p, g;
			if (e.readyState !== 4) {
				return true
			}
			if (e.status < 200 || e.status >= 300) {
				u = new i.ApiError(e, t, n);
				s(u);
				return true
			}
			d = e.getResponseHeader("x-dropbox-metadata");
			if (d != null ? d.length :
			void 0) {
				try {
					h = JSON.parse(d)
				} catch(m) {
					h =
					void 0
				}
			} else {
				h =
				void 0
			}
			if (r) {
				if (r === "b") {
					l = e.responseText != null ? e.responseText : e.response;
					a = [];
					for ( c = p = 0, g = l.length; 0 <= g ? p < g : p > g; c = 0 <= g ? ++p : --p) {
						a.push(String.fromCharCode(l.charCodeAt(c) & 255))
					}
					f = a.join("");
					s(null, f, h)
				} else {
					s(null, e.response, h)
				}
				return true
			}
			f = e.responseText != null ? e.responseText : e.response;
			switch(e.getResponseHeader("Content-Type")) {
				case"application/x-www-form-urlencoded":
					s(null, o.urlDecode(f), h);
					break;
				case"application/json":
				case"text/javascript":
					s(null, JSON.parse(f), h);
					break;
				default:
					s(null, f, h)
			}
			return true
		};
		e.onLoad = function(e, t, i, n) {
			var r;
			r = e.responseText;
			switch(e.contentType) {
				case"application/x-www-form-urlencoded":
					n(null, o.urlDecode(r),
					void 0);
					break;
				case"application/json":
				case"text/javascript":
					n(null, JSON.parse(r),
					void 0);
					break;
				default:
					n(null, r,
					void 0)
			}
			return true
		};
		e.onError = function(e, t, n, r) {
			var o;
			o = new i.ApiError(e, t, n);
			r(o);
			return true
		};
		return e
	}();
	o = i.Xhr;
	if (( typeof module !== "undefined" && module !== null ? module.exports :
	void 0) != null) {
		module.exports = i
	} else if ( typeof window !== "undefined" && window !== null) {
		window.Dropbox = i
	} else {
		throw new Error("This library only supports node.js and modern browsers.")
	}
	i.atob = f;
	i.btoa = _;
	i.hmac = m;
	i.sha1 = y;
	i.encodeKey = b;
	(function() {
		var e, t, i, n, r, o, s, u, a, l, c, h;
		if ( typeof S !== "undefined") {
			u = S
		} else {
			u = this.Nimbus = {}
		}
		u.version = "0.0.1";
		e = u.$ = this.jQuery || this.Zepto ||
		function() {
			return arguments[0]
		};
		u.dictModel = {};
		c = function(e) {
			return Array.prototype.slice.call(e, 0)
		};
		l = function(e) {
			return Object.prototype.toString.call(e) === "[object Array]"
		};
		if ( typeof Array.prototype.indexOf === "undefined") {
			Array.prototype.indexOf = function(e) {
				var t;
				t = 0;
				while (t < this.length) {
					if (this[t] === e) {
						return t
					}
					t++
				}
				return -1
			}
		}
		o = {
			bind : function(e, t) {
				var i, n, r;
				n = e.split(" ");
				i = this._callbacks || (this._callbacks = {});
				r = 0;
				while (r < n.length) {
					(this._callbacks[n[r]] || (this._callbacks[n[r]] = [])).push(t);
					r++
				}
				return this
			},
			trigger : function() {
				var e, t, i, n, r, o;
				e = c(arguments);
				i = e.shift();
				if (!( t = this._callbacks)) {
					return false
				}
				if (!( o = this._callbacks[i])) {
					return false
				}
				n = 0;
				r = o.length;
				while (n < r) {
					if (o[n].apply(this, e) === false) {
						return false
					}
					n++
				}
				return true
			},
			unbind : function(e, t) {
				var i, n, r, o;
				if (!e) {
					this._callbacks = {};
					return this
				}
				if (!( i = this._callbacks)) {
					return this
				}
				if (!( o = i[e])) {
					return this
				}
				if (!t) {
					delete this._callbacks[e];
					return this
				}
				n = 0;
				r = o.length;
				while (n < r) {
					if (t === o[n]) {
						o = o.slice();
						o.splice(n, 1);
						i[e] = o;
						break
					}
					n++
				}
				return this
			}
		};
		if ( typeof Object.create !== "function") {
			Object.create = function(e) {
				var t;
				t = function() {
				};
				t.prototype = e;
				return new t
			}
		}
		h = ["included", "extended"];
		n = {
			inherited : function() {
			},
			created : function() {
			},
			prototype : {
				initialize : function() {
				},
				init : function() {
				}
			},
			create : function(e, t) {
				var i;
				i = Object.create(this);
				i.parent = this;
				i.prototype = i.fn = Object.create(this.prototype);
				if (e) {
					i.include(e)
				}
				if (t) {
					i.extend(t)
				}
				i.created();
				this.inherited(i);
				return i
			},
			init : function() {
				var e;
				e = Object.create(this.prototype);
				e.parent = this;
				e.initialize.apply(e, arguments);
				e.init.apply(e, arguments);
				return e
			},
			proxy : function(e) {
				var t;
				t = this;
				return function() {
					return e.apply(t, arguments)
				}
			},
			proxyAll : function() {
				var e, t, i;
				e = c(arguments);
				t = 0;
				i = [];
				while (t < e.length) {
					this[e[t]] = this.proxy(this[e[t]]);
					i.push(t++)
				}
				return i
			},
			include : function(e) {
				var t, i;
				for (i in e) {
					if (h.indexOf(i) === -1) {
						this.fn[i] = e[i]
					}
				}
				t = e.included;
				if (t) {
					t.apply(this)
				}
				return this
			},
			extend : function(e) {
				var t, i;
				for (i in e) {
					if (h.indexOf(i) === -1) {
						this[i] = e[i]
					}
				}
				t = e.extended;
				if (t) {
					t.apply(this)
				}
				return this
			}
		};
		n.prototype.proxy = n.proxy;
		n.prototype.proxyAll = n.proxyAll;
		n.inst = n.init;
		n.sub = n.create;
		u.guid = function() {
			return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(e) {
				var t, i;
				t = Math.random() * 16 | 0;
				i = e === "x" ? t : t & 3 | 8;
				return i.toString(16)
			}).toUpperCase()
		};
		t = u.Auth = n.create();
		t.extend({
			reinitialize : function() {
				log("reintialize called");
				if (localStorage["service"] != null) {
					log("the service exists", localStorage["service"]);
					this.setup(localStorage["service"], localStorage["d_key"], localStorage["secret"], localStorage["app_name"]);
					return this.initialize()
				}
			},
			setup : function(e, t, i, n, r) {
				if ( typeof e === "string") {
					log("setup called");
					this.service = e;
					this.key = t;
					this.secret = i;
					this.app_name = n;
					if (r != null) {
						this.client_secret = r
					}
					localStorage["service"] = this.service;
					localStorage["d_key"] = this.key;
					localStorage["secret"] = this.secret;
					localStorage["app_name"] = this.app_name;
					if (r != null) {
						localStorage["client_secret"] = this.client_secret
					}
					switch(this.service) {
						case"Dropbox":
							this.extend(u.Auth.Dropbox_auth);
							this.authorize = this.proxy(this.authenticate_dropbox);
							this.initialize = this.proxy(this.initialize_dropbox);
							this.authorized = this.proxy(this.dropbox_authorized);
							this.logout = this.proxy(this.logout_dropbox);
							log("service is dropbox");
							break;
						case"GDrive":
							this.extend(u.Auth.GDrive);
							this.authorize = this.proxy(this.authenticate_gdrive);
							this.initialize = this.proxy(this.initialize_gdrive);
							this.authorized = this.proxy(this.gdrive_authorized);
							this.logout = this.proxy(this.logout_gdrive);
							log("service is GDrive");
							u.Share.setup(this.service);
							break;
						default:
							log("Invalid service name")
					}
					u.Binary.setup(this.service)
				} else if ( typeof e === "object") {
					log("new method for setup, the service is there");
					this.sync_services = e;
					this.models = {};
					if (localStorage["service"] != null) {
						if (localStorage["service"] === "GDrive") {
							this.setup(localStorage["service"], localStorage["d_key"], localStorage["secret"], localStorage["app_name"], localStorage["client_secret"])
						} else {
							this.setup(localStorage["service"], localStorage["d_key"], localStorage["secret"], localStorage["app_name"])
						}
					} else {
						this.extend(u.Auth.Multi);
						this.authorize = this.proxy(this.authenticate_service);
						this.initialize = this.proxy(this.initialize_service)
					}
				}
			},
			authorized : function() {
				return log("authorized not yet setup")
			},
			state : function() {
				return localStorage["state"]
			},
			authorize : function() {
				return log("authorize not yet setup")
			},
			initialize : function() {
				return log("initialize not setup")
			},
			authorized_callback : function() {
				return log("authorized callback undefined")
			},
			app_ready_func : function() {
				log("app_ready");
				return this.app_ready = true
			},
			set_app_ready : function(e) {
				log("set app ready");
				if (this.app_ready != null && this.app_ready) {
					return e()
				} else {
					return this.app_ready_func = e
				}
			},
			logout : function() {
				return log("logout not implemented")
			}
		});
		r = u.Client = n.create();
		a = u.Share = n.create();
		a.extend({
			setup : function(e) {
				switch(e) {
					case"GDrive":
						log("share api with GDrive");
						this.extend(u.Client.GDrive);
						this.get_users = this.proxy(this.get_shared_users);
						this.add_user = this.proxy(this.add_share_user);
						this.remove_user = this.proxy(this.remove_share_user);
						this.get_me = this.proxy(this.get_current_user);
						this.get_spaces = this.proxy(this.get_app_folders);
						return this.switch_spaces = this.proxy(this.switch_to_app_folder);
					default:
						return log("share not supported with this service")
				}
			},
			get_users : function() {
				return log("users not implemented")
			},
			add_user : function(e) {
				return log("add a user")
			},
			remove_user : function(e) {
				return log("removed user")
			},
			get_me : function() {
				return log("get currently logged user")
			},
			get_spaces : function() {
				return log("get current spaces")
			},
			switch_spaces : function(e) {
				return log("switch space")
			}
		});
		i = u.Binary = n.create();
		i.extend({
			setup : function(e) {
				log("binary setup called");
				switch(e) {
					case"Dropbox":
						this.extend(u.Client.Dropbox.Binary);
						log("service is dropbox");
						break;
					default:
						log("Invalid service name")
				}
				return window.binary_setup()
			},
			upload_blob : function(e, t, i) {
				return log("upload blob")
			},
			upload_file : function(e, t) {
				return log("upload blob")
			},
			read_file : function(e, t) {
				return log("read file")
			},
			share_link : function(e, t) {
				return log("share link")
			},
			direct_link : function(e, t) {
				return log("direct link")
			},
			delete_file : function(e) {
				return log("delete file")
			}
		});
		s = u.Model = n.create();
		s.extend(o);
		s.extend({
			service_setup : function(e) {
				var t;
				log("service setup model", e);
				t = e.attributes;
				switch(u.Auth.service) {
					case"Dropbox":
						log("extend as Dropbox");
						e.extend(u.Model.general_sync);
						e.extend(u.Model.Dropbox);
						t.push("synced");
						t.push("time");
						e.attributes = t;
						break;
					case"GDrive":
						log("extend as GDrive");
						e.extend(u.Model.general_sync);
						e.extend(u.Model.GDrive);
						t.push("gid");
						t.push("synced");
						t.push("time");
						e.attributes = t;
						window.model_initialize(e);
						break;
					default:
						log("Invalid service name")
				}
				return e
			},
			setup : function(e, t) {
				var i, n;
				log("model setup");
				n = s.sub();
				if (e) {
					n.name = e
				}
				if (t) {
					n.attributes = t
				}
				n.extend(u.Model.Local);
				if (u.Auth.service != null || u.Auth.sync_services != null || e === "binary" || e === "binary_Deletion") {
					log("model 1", n);
					if (e.indexOf("_Deletion") < 0) {
						n = this.service_setup(n)
					}
				} else {
					log("name:", e);
					log("Please setup Nimbus.Auth first before creating models")
				}
				if (e.indexOf("_Deletion") < 0) {
					i = u.Model.setup(e + "_" + "Deletion", ["deletion_id", "listid"]);
					i.extend(u.Model.Local);
					i.fetch();
					n.DeletionStorage = i
				}
				log(n);
				n.fetch();
				if (e.indexOf("_Deletion") < 0) {
					u.dictModel[e] = n
				}
				return n
			},
			created : function(e) {
				this.records = {};
				return this.attributes = this.attributes ? c(this.attributes) : []
			},
			find : function(e) {
				var t;
				t = this.records[e];
				if (!t) {
					throw "Unknown record"
				}
				return t.clone()
			},
			exists : function(e) {
				try {
					return this.find(e)
				} catch(t) {
					return false
				}
			},
			refresh : function(e) {
				var t, i, n;
				e = this.fromJSON(e);
				this.records = {};
				t = 0;
				i = e.length;
				while (t < i) {
					n = e[t];
					n.newRecord = false;
					this.records[n.id] = n;
					t++
				}
				this.trigger("refresh");
				return this
			},
			select : function(e) {
				var t, i;
				i = [];
				for (t in this.records) {
					if (e(this.records[t])) {
						i.push(this.records[t])
					}
				}
				return this.cloneArray(i)
			},
			findByAttribute : function(e, t) {
				var i;
				for (i in this.records) {
					if (this.records[i][e] === t) {
						return this.records[i].clone()
					}
				}
			},
			findAllByAttribute : function(e, t) {
				return this.select(function(i) {
					return i[e] === t
				})
			},
			each : function(e) {
				var t, i;
				i = [];
				for (t in this.records) {
					i.push(e(this.records[t]))
				}
				return i
			},
			all : function() {
				return this.cloneArray(this.recordsValues())
			},
			first : function() {
				var e;
				e = this.recordsValues()[0];
				return e && e.clone()
			},
			last : function() {
				var e, t;
				t = this.recordsValues();
				e = t[t.length - 1];
				return e && e.clone()
			},
			count : function() {
				return this.recordsValues().length
			},
			deleteAll : function() {
				var e, t;
				t = [];
				for (e in this.records) {
					t.push(
					delete this.records[e])
				}
				return t
			},
			destroyAll : function() {
				var e, t;
				t = [];
				for (e in this.records) {
					t.push(this.records[e].destroy())
				}
				return t
			},
			update : function(e, t) {
				return this.find(e).updateAttributes(t)
			},
			create : function(e) {
				var t;
				t = this.init(e);
				return t.save()
			},
			destroy : function(e) {
				return this.find(e).destroy()
			},
			sync : function(e) {
				return this.bind("change", e)
			},
			fetch : function(e) {
				if ( typeof e === "function") {
					return this.bind("fetch", e)
				} else {
					return this.trigger.apply(this, ["fetch"].concat(c(arguments)))
				}
			},
			toJSON : function() {
				return this.recordsValues()
			},
			fromJSON : function(e) {
				var t, i;
				if (!e) {
					return
				}
				if ( typeof e === "string") {
					e = JSON.parse(e)
				}
				if (l(e)) {
					i = [];
					t = 0;
					while (t < e.length) {
						i.push(this.init(e[t]));
						t++
					}
					return i
				} else {
					return this.init(e)
				}
			},
			recordsValues : function() {
				var e, t;
				t = [];
				for (e in this.records) {
					t.push(this.records[e])
				}
				return t
			},
			cloneArray : function(e) {
				var t, i;
				i = [];
				t = 0;
				while (t < e.length) {
					i.push(e[t].clone());
					t++
				}
				return i
			}
		});
		return s.include({
			model : true,
			newRecord : true,
			init : function(e) {
				if (e) {
					this.load(e)
				}
				return this.trigger("init", this)
			},
			isNew : function() {
				return this.newRecord
			},
			isValid : function() {
				return !this.validate()
			},
			validate : function() {
			},
			load : function(e) {
				var t, i;
				i = [];
				for (t in e) {
					i.push(this[t] = e[t])
				}
				return i
			},
			attributes : function() {
				var e, t, i;
				i = {};
				t = 0;
				while (t < this.parent.attributes.length) {
					e = this.parent.attributes[t];
					i[e] = this[e];
					t++
				}
				i.id = this.id;
				return i
			},
			eql : function(e) {
				return e && e.id === this.id && e.parent === this.parent
			},
			save : function() {
				var e;
				e = this.validate();
				if (e) {
					this.trigger("error", this, e);
					return false
				}
				this.trigger("beforeSave", this);
				if (this.newRecord) {
					this.create()
				} else {
					this.update()
				}
				this.trigger("save", this);
				return this
			},
			updateAttribute : function(e, t) {
				this[e] = t;
				return this.save()
			},
			updateAttributes : function(e) {
				this.load(e);
				return this.save()
			},
			destroy : function() {
				this.trigger("beforeDestroy", this);
				delete this.parent.records[this.id];
				this.destroyed = true;
				this.trigger("destroy", this);
				return this.trigger("change", this, "destroy")
			},
			dup : function() {
				var e;
				e = this.parent.init(this.attributes());
				e.newRecord = this.newRecord;
				return e
			},
			clone : function() {
				return Object.create(this)
			},
			reload : function() {
				var e;
				if (this.newRecord) {
					return this
				}
				e = this.parent.find(this.id);
				this.load(e.attributes());
				return e
			},
			toJSON : function() {
				return this.attributes()
			},
			exists : function() {
				return this.id && this.id in this.parent.records
			},
			update : function() {
				var e, t;
				this.trigger("beforeUpdate", this);
				t = this.parent.records;
				t[this.id].load(this.attributes());
				e = t[this.id].clone();
				this.trigger("update", e);
				return this.trigger("change", e, "update")
			},
			create : function() {
				var e, t;
				this.trigger("beforeCreate", this);
				if (!this.id) {
					this.id = u.guid()
				}
				this.newRecord = false;
				t = this.parent.records;
				t[this.id] = this.dup();
				e = t[this.id].clone();
				this.trigger("create", e);
				return this.trigger("change", e, "create")
			},
			bind : function(e, t) {
				return this.parent.bind(e, this.proxy(function(e) {
					if (e && this.eql(e)) {
						return t.apply(this, arguments)
					}
				}))
			},
			trigger : function() {
				return this.parent.trigger.apply(this.parent, arguments)
			}
		})
	})();
	c = function() {
		function e(e) {
			this._set = e ===
			void 0 ? [] : e;
			this.length = this._set.length;
			this.contains = function(e) {
				return this._set.indexOf(e) !== -1
			}
		}
		e.prototype.union = function(e) {
			var t, i, n, r;
			t = e.length > this.length ? e : this;
			i = e.length > this.length ? this : e;
			r = t.copy();
			n = 0;
			while (n < i.length) {
				r.add(i._set[n]);
				n++
			}
			return r
		};
		e.prototype.intersection = function(t) {
			var i, n, r, o, s;
			s = new e;
			i = t.length > this.length ? t : this;
			n = t.length > this.length ? this : t;
			o = 0;
			while (o < n.length) {
				r = n._set[o];
				if (i.contains(r)) {
					s.add(r)
				}
				o++
			}
			return s
		};
		e.prototype.difference = function(t) {
			var i, n, r;
			r = new e;
			n = 0;
			while (n < this.length) {
				i = this._set[n];
				if (!t.contains(i)) {
					r.add(i)
				}
				n++
			}
			return r
		};
		e.prototype.symmetricDifference = function(e) {
			return this.union(e).difference(this.intersection(e))
		};
		e.prototype.isSuperSet = function(e) {
			var t;
			t = 0;
			while (t < e.length) {
				if (!this.contains(e._set[t])) {
					return false
				}
				t++
			}
			return true
		};
		e.prototype.isSubSet = function(e) {
			var t;
			t = 0;
			while (t < this.length) {
				if (!e.contains(this._set[t])) {
					return false
				}
				t++
			}
			return true
		};
		e.prototype.add = function(e) {
			if (this._set.indexOf(e) === -1) {
				this._set.push(e);
				this.length++
			}
			return this.length
		};
		e.prototype.remove = function(e) {
			var t;
			t = this._set.indexOf(e);
			if (t !== -1) {
				this.length--;
				return this._set.splice(t,1)[0]
			} else {
				return null
			}
		};
		e.prototype.copy = function() {
			return new e(this._set.slice())
		};
		e.prototype.asArray = function() {
			return this._set
		};
		return e
	}();
	S = this;
	S.Set = c;
	e = function() {
		function e(e) {
			this.callback = e;
			this.ready = E(this.ready, this);
			this.ok = E(this.ok, this);
			this.wait = E(this.wait, this);
			this.count = 1
		}
		e.prototype.wait = function() {
			return this.count++
		};
		e.prototype.ok = function() {
			if (!--this.count) {
				return this.callback()
			}
		};
		e.prototype.ready = function() {
			return this.ok()
		};
		return e
	}();
	l = function() {
		function e() {
			this.execute_callback = E(this.execute_callback, this);
			this.add_last_call = E(this.add_last_call, this);
			this.add_call = E(this.add_call, this);
			this.running = false;
			this.callbacks = []
		}
		e.prototype.add_call = function(e) {
			this.running = true;
			return this.callbacks.push(e)
		};
		e.prototype.add_last_call = function(e) {
			return this.last_callback = e
		};
		e.prototype.execute_callback = function() {
			var e, t, i, n;
			n = this.callbacks;
			for ( t = 0, i = n.length; t < i; t++) {
				e = n[t];
				e()
			}
			this.callbacks = [];
			if (this.last_callback != null) {
				this.last_callback()
			}
			return this.running = false
		};
		return e
	}();
	t = function() {
		function e() {
			this.ready = E(this.ready, this);
			this.ok = E(this.ok, this);
			this.wait = E(this.wait, this);
			this.count = 1
		}
		e.prototype.wait = function() {
			return this.count++
		};
		e.prototype.ok = function() {
			if (!--this.count) {
				return log("ok executed")
			}
		};
		e.prototype.ready = function() {
			return this.ok()
		};
		return e
	}();
	S = this;
	S.DelayedOp = e;
	S.OneOp = l;
	S.DelayedSyncAnimation = t;
	window.debug = false;
	window.log = function() {
		var e;
		e = 1 <= arguments.length ? O.call(arguments, 0) : [];
		if (window.debug) {
			return console.log(e)
		}
	};
	window.one_time_sync = false;
	window.keys = function(e) {
		var t, i, n;
		i = [];
		for (t in e) {
			n = e[t];
			i.push(t)
		}
		return i
	};
	Nimbus.Model.general_sync = {
		cloudcache : {},
		create_object_dictionary : function() {
			var e, t, i, n, r;
			e = {};
			log("object:", this);
			r = this.all();
			for ( i = 0, n = r.length; i < n; i++) {
				t = r[i];
				e[t.id] = t
			}
			return e
		},
		sync_model_base_algo : function() {
			var e, t, i, n, r, o, s, u, a, l, h, d, f, p, g, m, y, _, w, v, b, S, k, x, A, C;
			log("#ONE TIME SYNC ALGO RUNNING", this.name);
			window.one_time_sync = true;
			window.currently_syncing = true;
			a = this.create_object_dictionary();
			e = this.cloudcache;
			h = new c(keys(a));
			t = new c(keys(e));
			log("local_set", h);
			log("cloud_set", t);
			n = [];
			k = this.DeletionStorage.all();
			for ( g = 0, w = k.length; g < w; g++) {
				o = k[g];
				this.delete_from_cloud(o.id);
				n.push(o.id);
				o.destroy()
			}
			r = new c(n);
			log("deleted set", r);
			log("#the set of ids that are there locally but not there on the cloud", h.difference(t)._set);
			x = h.difference(t)._set;
			for ( m = 0, v = x.length; m < v; m++) {
				u = x[m];
				l = a[u];
				if (l["synced"] != null && l.synced) {
					log("id for deletion", u);
					a[u].destroy()
				} else {
					this.add_to_cloud(l)
				}
			}
			log("#the set of ids that are there on the cloud but not there locally minus deletions", t.difference(h).difference(r)._set);
			A = t.difference(h).difference(r)._set;
			for ( y = 0, b = A.length; y < b; y++) {
				u = A[y];
				this.add_from_cloud(u)
			}
			log("#the set of ids that are there in the cloud and locally", t.intersection(h)._set);
			f = [];
			p = [];
			s = [];
			C = t.intersection(h)._set;
			for ( _ = 0, S = C.length; _ < S; _++) {
				u = C[_];
				d = new Date(a[u].time);
				i = new Date(e[u].time);
				log("local_time", d.toString());
				log("cloud_time", i.toString());
				if (d - i === 0) {
					log("equal time stamp do nothin", e[u].title);
					s.push(u)
				} else if (d - i > 0) {
					this.update_to_cloud(a[u]);
					f.push(u)
				} else {
					this.update_to_local(a[u]);
					p.push(u)
				}
			}
			window.currently_syncing = false;
			window.one_time_sync = false;
			log("updated to cloud", f.length, f);
			log("updated to local", p.length, p);
			return log("equal timestamp", s.length, s)
		},
		real_time_sync : function(e, t, i) {
			var n, r;
			log("method", t);
			log("record", e);
			this.saveLocal();
			if (window.currently_syncing) {
				return true
			} else {
				if (t === "update") {
					this.records[e.id].time = (new Date).toString()
				}
			}
			r = navigator.onLine && (localStorage["state"] === "Working" || Nimbus.Client.GDrive.check_auth());
			if (!r) {
				console.log("syncing is not setup correctly or the instance is not online");
				return true
			}
			switch(t) {
				case"destroy":
					if (e.synced) {
						if (r) {
							log("deletion in cloud");
							return this.delete_from_cloud(e.id)
						} else {
							n = Deletion.init({
								id : e.id
							});
							return n.save()
						}
					}
					break;
				case"create":
					return this.add_to_cloud(e, function() {
					});
				case"update":
					return this.update_to_cloud(e, function() {
					});
				case"read":
					return this.update_to_local(e, function() {
					});
				default:
					return log("REAL TIME SYNCING FAILED, THIS METHOD NOT IMPLEMENTED")
			}
		},
		delta_update : function() {
			var e;
			return e = this.get_delta
		}
	};
	Nimbus.Model.Local = {
		extended : function() {
			this.sync(this.proxy(this.saveLocal));
			return this.fetch(this.proxy(this.loadLocal))
		},
		saveLocal : function() {
			var e;
			e = JSON.stringify(this);
			return localStorage[this.name] = e
		},
		loadLocal : function() {
			var e;
			e = localStorage[this.name];
			if (!e) {
				return
			}
			e = JSON.parse(e);
			return this.refresh(e)
		}
	};
	Nimbus.Model.Dropbox = {
		cloudcache : {},
		last_hash : "",
		hash : "",
		toCloudStructure : function(e) {
			log("local to cloud structure");
			return JSON.stringify(e)
		},
		fromCloudStructure : function(e) {
			log("changes cloud to local data in the form a dictionary");
			return e
		},
		diff_objects : function(e, t) {
			var i, n, r;
			i = {};
			for (n in e) {
				r = e[n];
				if (t[n] !== e[n]) {
					i[n] = [t[n], e[n]]
				}
			}
			if (e["parent_id"] != null !== (t["parent_id"] != null)) {
				i["parent_id"] = ["one of them is null"]
			}
			return i
		},
		add_to_cloud : function(e, t) {
			log("add to cloud", e.name);
			return Nimbus.Client.Dropbox.putFileContents("/" + Nimbus.Auth.app_name + ("/" + this.name + "/" + e.id + ".txt"), this.toCloudStructure(e), function(i) {
				log(e.name, "finished being added to cloud");
				log("resp", i);
				window.currently_syncing = true;
				e.time = i.modified;
				e.synced = true;
				e.save();
				window.currently_syncing = false;
				if (t != null) {
					return t(i)
				}
			})
		},
		delete_from_cloud : function(e, t) {
			log("delete from cloud", e);
			log("delete route", "/" + Nimbus.Auth.app_name + ("/" + this.name + "/" + e + ".txt"));
			return Nimbus.Client.Dropbox.deletePath("/" + Nimbus.Auth.app_name + ("/" + this.name + "/" + e + ".txt"), function() {
				log("finished delete from cloud", e);
				if (t != null) {
					return t()
				}
			})
		},
		update_to_cloud : function(e, t) {
			log("updated to cloud", e.name);
			return Nimbus.Client.Dropbox.putFileContents("/" + Nimbus.Auth.app_name + ("/" + this.name + "/" + e.id + ".txt"), this.toCloudStructure(e), function(i) {
				log(e.name, "finished being updated to cloud");
				window.currently_syncing = true;
				e.time = i.modified;
				e.synced = true;
				e.save();
				window.currently_syncing = false;
				if (t != null) {
					return t(i)
				}
			})
		},
		add_from_cloud : function(e, t) {
			var i = this;
			log("add from cloud", e);
			return Nimbus.Client.Dropbox.getFileContents("/" + Nimbus.Auth.app_name + ("/" + this.name + "/" + e + ".txt"), function(n) {
				var r, o;
				log("cloud read data", n);
				window.currently_syncing = true;
				r = i.fromCloudStructure(n);
				o = i.init(r);
				o.synced = true;
				o.time = i.cloudcache[e].time;
				o.save();
				window.currently_syncing = false;
				if (t != null) {
					return t(n)
				}
			})
		},
		update_to_local : function(e, t) {
			var i = this;
			log("update to local", e.name);
			return Nimbus.Client.Dropbox.getFileContents("/" + Nimbus.Auth.app_name + ("/" + this.name + "/" + e.id + ".txt"), function(t) {
				var n, r;
				log("cloud read data", t);
				window.currently_syncing = true;
				n = i.fromCloudStructure(t);
				r = i.find(e.id);
				n.time = i.cloudcache[e.id].time;
				r.updateAttributes(n);
				return window.currently_syncing = false
			})
		},
		sync_all : function(t) {
			var i = this;
			log("syncs all the data, normally happens at the start of a program or coming back from offline");
			window.current_syncing = new e(function() {
				log("call back sync called");
				window.current_syncing = new e(function() {
					window.current_syncing = null;
					if (t != null) {
						return t()
					}
				});
				i.sync_model_base_algo();
				return window.current_syncing.ready()
			});
			this.load_all_from_cloud();
			return window.current_syncing.ready()
		},
		load_all_from_cloud : function() {
			var e = this;
			log("loads all the data from the cloud locally, probably not feasible with dropbox and changes need to happen");
			this.cloudcache = {};
			try {
				return Nimbus.Client.Dropbox.getMetadataList("/" + Nimbus.Auth.app_name + "/" + this.name, function(t) {
					var i, n, r, o, s, u, a;
					log("call back load called");
					log("data", t);
					u = t.contents;
					a = [];
					for ( o = 0, s = u.length; o < s; o++) {
						r = u[o];
						n = r.path;
						i = n.replace("/" + Nimbus.Auth.app_name + "/" + ("" + e.name + "/"), "").replace(".txt", "");
						a.push(e.cloudcache[i] = {
							id : i,
							time : r.modified
						})
					}
					return a
				})
			} catch(t) {
				return log("trying to get the folder failed, probably cuz it don't exist", t)
			}
		},
		get_delta : function() {
			return log("get the delta for ", this.name, " since last synced")
		},
		extended : function() {
			this.sync(this.proxy(this.real_time_sync));
			return this.fetch(this.proxy(this.loadLocal))
		}
	};
	Nimbus.Auth.Dropbox_auth = {
		authenticate_dropbox : function() {
			localStorage["key"] = this.key;
			localStorage["secret"] = this.secret;
			localStorage["state"] = "Auth";
			return Nimbus.Client.Dropbox.get_request_token(this.key, this.secret, Nimbus.Client.Dropbox.authorize_token)
		},
		initialize_dropbox : function() {
			log("initialization called");
			if (document.URL.slice(0, 6) === "chrome") {
				log("Chrome edition authentication");
				chrome.tabs.onUpdated.addListener(function(e, t, i) {
					if (i.title === "API Request Authorized - Dropbox") {
						chrome.tabs.remove(e);
						return Nimbus.Client.Dropbox.get_access_token(function(e) {
							localStorage["state"] = "Working";
							if (Nimbus.Auth.authorized_callback != null) {
								Nimbus.Auth.authorized_callback()
							}
							Nimbus.Auth.app_ready_func();
							return console.log("NimbusBase is working! Chrome edition.")
						})
					}
				})
			}
			if (localStorage["state"] != null && localStorage["state"] === "Auth") {
				return Nimbus.Client.Dropbox.get_access_token(function(e) {
					localStorage["state"] = "Working";
					if (Nimbus.Auth.authorized_callback != null) {
						Nimbus.Auth.authorized_callback()
					}
					Nimbus.Auth.app_ready_func();
					return console.log("NimbusBase is working!")
				})
			} else {
				return Nimbus.Auth.app_ready_func()
			}
		},
		dropbox_authorized : function() {
			if (Nimbus.Auth.service === "Dropbox") {
				if (localStorage["state"] === "Working") {
					return true
				} else {
					return false
				}
			} else {
				return false
			}
		},
		logout_dropbox : function(e) {
			var t, i, n;
			localStorage.clear();
			if (Nimbus.dictModel != null) {
				n = Nimbus.dictModel;
				for (t in n) {
					i = n[t];
					i.records = {}
				}
			}
			if (this.sync_services != null) {
				Nimbus.Auth.setup(this.sync_services)
			}
			if (e != null) {
				return e()
			}
		}
	};
	Nimbus.Client.Dropbox = {
		get_request_token : function(e, t, i) {
			var n, r;
			r = new XMLHttpRequest;
			r.open("POST", "https://api.dropbox.com/1/oauth/request_token", true);
			n = 'OAuth oauth_version="1.0",oauth_signature_method="PLAINTEXT",oauth_consumer_key="' + e + '",oauth_signature="' + t + '&"';
			log(n);
			r.setRequestHeader("Authorization", n);
			r.onreadystatechange = function() {
				var e, t, n, r, o, s, u, a, l, c;
				if (this.readyState === 4) {
					if (this.status === 200) {
						e = this.response;
						log(e);
						o = e.split(/&/);
						s = {};
						for ( l = 0, c = o.length; l < c; l++) {
							t = o[l];
							r = t.split(RegExp("="), 2);
							s[r[0]] = r[1]
						}
						log("Token result", s);
						for (n in s) {
							a = s[n];
							localStorage[n] = a
						}
						window.request_token = s;
						if (i != null) {
							return i(s)
						}
					} else {
						try {
							u = JSON.parse(u)
						} catch(h) {
						}
						return error(u, this.status, this)
					}
				}
			};
			return r.send()
		},
		authorize_token : function(e) {
			var t, i, n;
			log("authorize url", document.URL);
			if (document.URL.slice(0, 4) === "file" && ( typeof cordova !== "undefined" && cordova !== null)) {
				log("Phonegap login");
				t = "https://www.dropbox.com/1/oauth/authorize?oauth_token=" + e.oauth_token;
				i = window.open(t, "_blank", "location=yes");
				window.ref = i;
				window.auth_count = 0;
				i.addEventListener("loadstop", function(e) {
					console.log(e);
					console.log("event", e.url.indexOf("https://www.dropbox.com/1/oauth/authorize"));
					if (e.url.indexOf("https://www.dropbox.com/1/oauth/authorize") >= 0) {
						window.auth_count = window.auth_count + 1;
						if (window.auth_count === 2) {
							Nimbus.Auth.Dropbox_auth.initialize_dropbox();
							return window.ref.close()
						}
					}
				});
				return i.addEventListener("exit", function(e) {
					return Nimbus.Auth.logout_dropbox()
				})
			} else if (document.URL.slice(0, 4) === "http") {
				n = "&oauth_callback=" + encodeURI(document.URL);
				t = "https://www.dropbox.com/1/oauth/authorize?oauth_token=" + e.oauth_token + n;
				return location.replace(t)
			} else if (document.URL.slice(0, 6) === "chrome") {
				log("chrome app!");
				t = "https://www.dropbox.com/1/oauth/authorize?oauth_token=" + e.oauth_token;
				return chrome.tabs.create({
					url : t,
					selected : true
				}, function(e) {
					return log("tab created", e.id)
				})
			} else {
				t = "https://www.dropbox.com/1/oauth/authorize?oauth_token=" + e.oauth_token;
				return location.replace(t)
			}
		},
		get_access_token : function(e) {
			var t, i, n, r;
			i = localStorage["oauth_token"];
			n = localStorage["oauth_token_secret"];
			t = 'OAuth oauth_version="1.0",oauth_signature_method="PLAINTEXT",oauth_consumer_key="' + Nimbus.Auth.key + '",oauth_token="' + i + '",oauth_signature="' + Nimbus.Auth.secret + "&" + n + '"';
			log("auth_string:", t);
			r = new XMLHttpRequest;
			r.open("POST", "https://api.dropbox.com/1/oauth/access_token", true);
			r.setRequestHeader("Authorization", t);
			r.onreadystatechange = function() {
				var t, i, n, r, o, s, u, a, l, c;
				if (this.readyState === 4) {
					if (this.status === 200) {
						i = this.response;
						log(i);
						s = i.split(/&/);
						t = {};
						for ( l = 0, c = s.length; l < c; l++) {
							n = s[l];
							o = n.split(RegExp("="), 2);
							t[o[0]] = o[1]
						}
						log("Access result", t);
						for (r in t) {
							a = t[r];
							localStorage[r] = a
						}
						window.access_token = t;
						if (e != null) {
							return e(t)
						}
					} else {
						try {
							u = JSON.parse(u)
						} catch(h) {
						}
						return log(u, this.status, this)
					}
				}
			};
			return r.send()
		},
		send_request : function(e, t, i, n, r) {
			var o, s, u, a, l, c;
			u = localStorage["oauth_token"];
			a = localStorage["oauth_token_secret"];
			o = 'OAuth oauth_version="1.0",oauth_signature_method="PLAINTEXT",oauth_consumer_key="' + Nimbus.Auth.key + '",oauth_token="' + u + '",oauth_signature="' + Nimbus.Auth.secret + "&" + a + '"';
			log("auth_string:", o);
			c = new XMLHttpRequest;
			c.open(e, t, true);
			c.setRequestHeader("Authorization", o);
			c.onreadystatechange = function() {
				var e;
				if (this.readyState === 4) {
					if (this.status === 200) {
						e = this.response;
						try {
							e = JSON.parse(e)
						} catch(t) {
						}
						log("REQUEST RESULT", e);
						if (n != null) {
							n(e)
						}
					} else {
						try {
							e = JSON.parse(e)
						} catch(t) {
						}
						log(e, this.status, this);
						if (r != null) {
							r(e)
						}
					}
					if (window.current_syncing != null) {
						return window.current_syncing.ok()
					}
				}
			};
			if (e === "POST") {
				c.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
				if (i) {
					l = [];
					for (s in i) {
						l.push(encodeURIComponent(s) + "=" + encodeURIComponent(i[s]))
					}
					i = l.length > 0 ? l.join("&").replace(/%20/g, "+") : null
				}
				log(i)
			}
			log("send request params", e, t, i, n, r);
			if (window.current_syncing != null) {
				window.current_syncing.wait()
			}
			return c.send(i)
		},
		putFileContents : function(e, t, i, n) {
			log("putFileContents");
			return Nimbus.Client.Dropbox.send_request("PUT", "https://api-content.dropbox.com/1/files_put/sandbox" + e, t, i, n)
		},
		deletePath : function(e, t, i) {
			log("deletePath");
			return Nimbus.Client.Dropbox.send_request("POST", "https://api.dropbox.com/1/fileops/delete", {
				root : "sandbox",
				path : e
			}, t, i)
		},
		getFileContents : function(e, t, i) {
			log("getFileContents");
			return Nimbus.Client.Dropbox.send_request("GET", "https://api-content.dropbox.com/1/files/sandbox" + e, "", t, i)
		},
		getMetadataList : function(e, t, i) {
			log("getMetadataList");
			return Nimbus.Client.Dropbox.send_request("GET", "https://api.dropbox.com/1/metadata/sandbox" + e, "", t, i)
		}
	};
	window.binary_setup = function() {
		var e;
		e = Nimbus.Model.setup("binary", ["name", "path", "copied", "directlink", "sharelink", "expiration"]);
		S = this;
		return S.binary = e
	};
	window.client = null;
	Nimbus.Client.Dropbox.Binary = {
		initialize_client : function() {
			log("initializing second client");
			if (Nimbus.Auth.key != null) {
				if (!(window.client != null)) {
					window.client = new i.Client({
						key : Nimbus.Auth.key,
						secret : Nimbus.Auth.secret,
						sandbox : true
					});
					return window.client.oauth.setToken(localStorage["oauth_token"], localStorage["oauth_token_secret"])
				} else {
				}
			} else {
				return log("can't upload file with no dropbox credentials")
			}
		},
		upload_blob : function(e, t, i) {
			var n, r;
			log("upload new blob");
			Nimbus.Client.Dropbox.Binary.initialize_client();
			if (window.client != null) {
				r = binary.create({
					name : t,
					copied : false
				});
				n = function(e, t) {
					console.log("wrote file to cloud");
					console.log(e, t);
					r.copied = true;
					r.path = t.path;
					r.save();
					if (i != null) {
						return i(r)
					}
				};
				log("file name", t);
				return window.client.writeFile(t, e, n)
			} else {
				return log("client won't initialize")
			}
		},
		upload_file : function(e, t) {
			var i, n;
			log("upload new file");
			Nimbus.Client.Dropbox.Binary.initialize_client();
			if (window.client != null) {
				n = binary.create({
					name : e.name,
					copied : false
				});
				i = function(e, i) {
					console.log("wrote file to cloud");
					console.log(e, i);
					n.copied = true;
					n.path = i.path;
					n.save();
					if (t != null) {
						return t(n)
					}
				};
				log("file name", e.name);
				return window.client.writeFile(e.name, e, i)
			} else {
				return log("client won't initialize")
			}
		},
		read_file : function(e, t) {
			var i;
			log("read a binary file from the server");
			Nimbus.Client.Dropbox.Binary.initialize_client();
			if (window.client != null) {
				i = function(e, i, n) {
					console.log(e, i, n);
					return t(i)
				};
				return window.client.readFile(e.path, {
					blob : true
				}, i)
			} else {
				return log("client won't initialize")
			}
		},
		share_link : function(e, t) {
			var i;
			log("get the share link");
			Nimbus.Client.Dropbox.Binary.initialize_client();
			if (window.client != null) {
				i = function(i, n) {
					console.log(i, n);
					e.sharelink = n.url;
					e.save();
					return t(n)
				};
				console.log(e.path);
				return window.client.makeUrl(e.path, {}, i)
			}
		},
		direct_link : function(e, t) {
			var i;
			log("get the share link");
			Nimbus.Client.Dropbox.Binary.initialize_client();
			if (window.client != null) {
				if (e.directlink != null && new Date(e.expiration) > new Date) {
					return t({
						url : e.directlink,
						expiresAt : e.expiration
					})
				} else {
					i = function(i, n) {
						console.log(i, n);
						e.directlink = n.url;
						e.expiration = n.expiresAt.toString();
						e.save();
						return t(n)
					};
					return window.client.makeUrl(e.path, {
						download : true,
						downloadHack : true
					}, i)
				}
			}
		},
		delete_file : function(e) {
			var t;
			log("delete file");
			Nimbus.Client.Dropbox.Binary.initialize_client();
			if (window.client != null) {
				t = function(t, i) {
					return e.destroy()
				};
				return window.client.remove(e.path, t)
			} else {
				return log("client won't initialize")
			}
		}
	};
	Nimbus.Client.GDrive = {
		check_auth : function() {
			log("checking if this is authenticated");
			return gapi.auth != null && gapi.auth.getToken() !== null
		},
		authorize : function(e, t, i) {
			log("authorized called");
			return gapi.auth.authorize({
				client_id : e,
				scope : t,
				immediate : false
			}, i)
		},
		insertFile : function(e, t, i, n, r) {
			var o, s, u, a, l, c, h;
			log("putFileContents");
			s = "-------314159265358979323846";
			a = "\r\n--" + s + "\r\n";
			u = "\r\n--" + s + "--";
			o = _(e);
			l = {
				title : t,
				mimeType : i
			};
			if (n != null) {
				l["parents"] = [{
					kind : "drive#fileLink",
					id : n
				}]
			}
			c = a + "Content-Type: application/json\r\n\r\n" + JSON.stringify(l) + a + "Content-Type: " + i + "\r\n" + "Content-Transfer-Encoding: base64\r\n" + "\r\n" + o + u;
			log("MULTI: ", c);
			if (!r) {
				r = function(e) {
					return log("Update Complete ", e)
				}
			}
			h = {
				path : "/upload/drive/v2/files",
				method : "POST",
				params : {
					uploadType : "multipart"
				},
				headers : {
					"Content-Type" : 'multipart/mixed; boundary="' + s + '"'
				},
				body : c
			};
			return this.make_request(h, r)
		},
		deleteFile : function(e, t) {
			var i, n = this;
			log("deletePath");
			if (!t) {
				t = function(t) {
					var i;
					i = {
						path : "/drive/v2/files/" + e,
						method : "DELETE"
					};
					n.make_request(i, function(e) {
						return log("delete complete", e)
					});
					return log("Delete Complete ", t)
				}
			}
			i = {
				path : "/drive/v2/files/" + e + "/trash",
				method : "POST"
			};
			return this.make_request(i, t)
		},
		getFile : function(e, t) {
			var i;
			log("getFileContents");
			if (!t) {
				t = function(e) {
					return log("Read Complete ", e)
				}
			}
			i = {
				path : "/drive/v2/files/" + e,
				method : "GET"
			};
			return this.make_request(i, t)
		},
		readFile : function(e, t) {
			var i, n;
			if (!t) {
				t = function(e) {
					return log("Read Complete ", e)
				}
			}
			i = gapi.auth.getToken().access_token;
			n = new XMLHttpRequest;
			n.open("GET", e);
			n.setRequestHeader("Authorization", "Bearer " + i);
			n.onload = function() {
				t(n.responseText);
				if (window.current_syncing != null) {
					return window.current_syncing.ok()
				}
			};
			n.onerror = function() {
				return t(null)
			};
			if (window.current_syncing != null) {
				window.current_syncing.wait()
			}
			return n.send()
		},
		updateFile : function(e, t, i, n, r, o) {
			var s, u, a, l, c, h, d;
			log("updateFileContents");
			u = "-------314159265358979323846";
			l = "\r\n--" + u + "\r\n";
			a = "\r\n--" + u + "--";
			i = "text/html";
			c = {
				mimeType : i
			};
			s = _(e);
			c = {
				title : t,
				mimeType : i
			};
			h = l + "Content-Type: application/json\r\n\r\n" + JSON.stringify(c) + l + "Content-Type: " + i + "\r\n" + "Content-Transfer-Encoding: base64\r\n" + "\r\n" + s + a;
			if (!o) {
				o = function(e) {
					return log("Update Complete ", e)
				}
			}
			d = {
				path : "/upload/drive/v2/files/" + n,
				method : "PUT",
				params : {
					fileId : n,
					uploadType : "multipart"
				},
				headers : {
					"Content-Type" : 'multipart/mixed; boundary="' + u + '"'
				},
				body : h
			};
			return this.make_request(d, o)
		},
		getMetadataList : function(e, t) {
			var i;
			log("getMetadataList");
			if (!t) {
				t = function(e) {
					return log("List of files", e)
				}
			}
			i = {
				path : "/drive/v2/files",
				method : "GET",
				params : {
					q : e
				}
			};
			return this.make_request(i, t)
		},
		make_request : function(e, t) {
			e["callback"] = function(e) {
				if (t != null) {
					t(e)
				}
				if (window.current_syncing != null) {
					return window.current_syncing.ok()
				}
			};
			if (window.current_syncing != null) {
				window.current_syncing.wait()
			}
			return gapi.client.request(e)
		},
		get_current_user : function(e) {
			var t, i, n = this;
			log("get current user");
			i = function(t) {
				var i;
				log("About called ", t);
				i = {};
				i.name = t["user"].displayName;
				i.id = t["user"].permissionId;
				if (t["user"].picture != null) {
					i.pic = t["user"].picture.url
				}
				if (e != null) {
					return e(i)
				}
			};
			t = {
				path : "/drive/v2/about",
				method : "GET"
			};
			return this.make_request(t, i)
		},
		add_share_user : function(e, t) {
			var i, n, r, o = this;
			log("&&& add share user");
			r = function(e) {
				var i;
				log("Add Share user Complete ", e);
				i = {
					id : e.id,
					name : e.name,
					role : e.role
				};
				if (e.photoLink != null) {
					i["pic"] = e.photoLink
				}
				if (t != null) {
					return t(i)
				}
			};
			i = window.folder[Nimbus.Auth.app_name].id;
			n = {
				path : "/drive/v2/files/" + i + "/permissions",
				method : "POST",
				params : {
					fileId : i
				},
				body : {
					role : "writer",
					type : "user",
					value : e
				}
			};
			return this.make_request(n, r)
		},
		remove_share_user : function(e, t) {
			var i, n;
			log("&&& remove a user from sharing this app");
			i = window.folder[Nimbus.Auth.app_name].id;
			if (!t) {
				t = function(e) {
					return log("Permission Removal Complete ", e)
				}
			}
			n = {
				path : "/drive/v2/files/" + i + "/permissions/" + e,
				method : "DELETE"
			};
			return this.make_request(n, t)
		},
		get_shared_users : function(e) {
			var t, i, n, r = this;
			log("&&& get shared users");
			t = window.folder[Nimbus.Auth.app_name].id;
			n = function(t) {
				var i, n, r, o, s, u;
				log("Update Complete ", t);
				r = [];
				u = t.items;
				for ( o = 0, s = u.length; o < s; o++) {
					i = u[o];
					n = {
						id : i.id,
						name : i.name,
						role : i.role
					};
					if (i.photoLink != null) {
						n["pic"] = i.photoLink
					}
					r.push(n)
				}
				log("permissions", r);
				if (e != null) {
					return e(r)
				}
			};
			i = {
				path : "/drive/v2/files/" + t + "/permissions",
				method : "GET"
			};
			return this.make_request(i, n)
		},
		get_app_folders : function(e) {
			log("&&& get app folders");
			return Nimbus.Client.GDrive.getMetadataList("mimeType = 'application/vnd.google-apps.folder' and title = '" + Nimbus.Auth.app_name + "'", function(t) {
				var i, n, r, o, s, u;
				log(t);
				n = t.items;
				o = [];
				if (t.items != null) {
					for ( s = 0, u = n.length; s < u; s++) {
						i = n[s];
						r = {};
						r.id = i.id;
						r.owner = i.ownerNames[0];
						o.push(r)
					}
				}
				log(o);
				if (e != null) {
					return e(o)
				}
			})
		},
		switch_to_app_folder : function(t, i) {
			var n = this;
			log("###switch to app folder");
			window.folder = {};
			window.folder[Nimbus.Auth.app_name] = {
				title : Nimbus.Auth.app_name,
				id : t
			};
			window.current_syncing = new e(function() {
				if (i != null) {
					return i()
				}
			});
			localStorage["main_folder_id"] = t;
			Nimbus.Client.GDrive.getMetadataList("mimeType = 'application/vnd.google-apps.folder'", function(e) {
				var i, n, r, o, s, u, a, l;
				i = e.items;
				log("###rewriting folders", i);
				for ( s = 0, u = i.length; s < u; s++) {
					o = i[s];
					log(o);
					if (o.parents.length > 0 && o.parents[0].id === t) {
						window.folder[o.title] = o
					}
				}
				if (Nimbus.dictModel != null) {
					a = Nimbus.dictModel;
					l = [];
					for (n in a) {
						r = a[n];
						l.push(r.records = {})
					}
					return l
				}
			});
			return window.current_syncing.ready()
		}
	};
	window.nimbus_error = [];
	Nimbus.Model.GDrive = {
		cloudcache : {},
		last_hash : "",
		hash : "",
		toCloudStructure : function(e) {
			log("local to cloud structure");
			return JSON.stringify(e)
		},
		fromCloudStructure : function(e) {
			log("changes cloud to local data in the form a dictionary");
			return JSON.parse(e)
		},
		diff_objects : function(e, t) {
			var i, n, r;
			i = {};
			for (n in e) {
				r = e[n];
				if (t[n] !== e[n]) {
					i[n] = [t[n], e[n]]
				}
			}
			if (e["parent_id"] != null !== (t["parent_id"] != null)) {
				i["parent_id"] = ["one of them is null"]
			}
			return i
		},
		add_to_cloud : function(e, t) {
			var i, n;
			log("add to cloud", e);
			n = e.parent.name;
			i = window.folder[n].id;
			return Nimbus.Client.GDrive.insertFile(this.toCloudStructure(e), e.id, "text/plain", i, function(t) {
				log("logging data inserted", t);
				window.currently_syncing = true;
				e.gid = t.id;
				e.time = t.modifiedDate;
				e.synced = true;
				e.save();
				return window.currently_syncing = false
			})
		},
		delete_from_cloud : function(e, t) {
			log("delete from cloud", e);
			return Nimbus.Client.GDrive.getMetadataList("title = '" + e + "'", function(e) {
				var i;
				log("data", e);
				if (e.items.length > 0) {
					i = e.items[0].id;
					Nimbus.Client.GDrive.deleteFile(i);
					if (t != null) {
						return t()
					}
				} else {
					return log("file to be deleted not there")
				}
			})
		},
		update_to_cloud : function(e, t) {
			var i, n, r, o, s = this;
			log("updated to cloud", e.name);
			r = e.parent.name;
			n = window.folder[r].id;
			o = function(t) {
				log("logging data inserted", t);
				window.currently_syncing = true;
				e.time = t.modifiedDate;
				e.save();
				e.synced = true;
				return window.currently_syncing = false
			};
			i = function(t) {
				var i;
				i = t.items[0].id;
				return Nimbus.Client.GDrive.updateFile(s.toCloudStructure(e), e.id, "text/plain", i, n, function(t) {
					log("logging data inserted", t);
					window.currently_syncing = true;
					e.time = t.modifiedDate;
					e.save();
					return window.currently_syncing = false
				})
			};
			if (e.gid != null) {
				return Nimbus.Client.GDrive.updateFile(this.toCloudStructure(e), e.id, "text/plain", e.gid, n, function(t) {
					log("logging data updated", t);
					window.currently_syncing = true;
					e.time = t.modifiedDate;
					e.save();
					return window.currently_syncing = false
				})
			} else {
				return Nimbus.Client.GDrive.getMetadataList("title = '" + e.id + "'", i)
			}
		},
		add_from_cloud : function(e, t) {
			var i, n = this;
			log("add from cloud GDrive", e);
			i = function(t) {
				var i, r;
				log("cloud url data", JSON.parse(t));
				window.currently_syncing = true;
				i = n.fromCloudStructure(t);
				r = n.init(i);
				r.synced = true;
				r.time = n.cloudcache[e].time;
				r.save();
				return window.currently_syncing = false
			};
			return Nimbus.Client.GDrive.getMetadataList("title = '" + e + "'", function(e) {
				var t;
				log("cloud read data", e);
				window.data = e;
				if (e.items != null && e.items.length >= 1) {
					t = window.data.items[0].downloadUrl;
					return Nimbus.Client.GDrive.readFile(t, i)
				} else {
					return log("This data is not there")
				}
			})
		},
		update_to_local : function(e, t) {
			var i, n = this;
			log("update to local", e);
			i = function(t) {
				var i, r;
				log("cloud url data", JSON.parse(t));
				window.currently_syncing = true;
				i = n.fromCloudStructure(t);
				r = n.find(e.id);
				i.time = n.cloudcache[e.id].time;
				r.updateAttributes(i);
				return window.currently_syncing = false
			};
			return Nimbus.Client.GDrive.getMetadataList("title = '" + e.id + "'", function(t) {
				var n;
				log("cloud read data", t);
				window.data = t;
				if (t.error != null) {
					window.nimbus_error.push({
						error : t.error,
						object : e
					});
					return console.log("##ERROR writing back to local", t.error, "object: ", e)
				} else {
					if (t.items.length >= 1) {
						n = window.data.items[0].downloadUrl;
						return Nimbus.Client.GDrive.readFile(n, i)
					} else {
						return log("This data is not there")
					}
				}
			})
		},
		sync_all : function(t) {
			var i = this;
			log("syncs all the data, normally happens at the start of a program or coming back from offline");
			window.current_syncing = new e(function() {
				log("call back sync called");
				window.current_syncing = new e(function() {
					window.current_syncing = null;
					if (t != null) {
						return t()
					}
				});
				i.sync_model_base_algo();
				return window.current_syncing.ready()
			});
			this.load_all_from_cloud();
			return window.current_syncing.ready()
		},
		load_all_from_cloud : function() {
			var e, t, i, n = this;
			log("loads all the data from the cloud locally");
			this.cloudcache = {};
			i = this.name;
			log("object name", i);
			if (window.folder[i] != null) {
				t = window.folder[i].id;
				e = function(e) {
					var t, r, o, s, u;
					log("cloud read data", i, e);
					window.data = e;
					if (e.items != null) {
						s = e.items;
						u = [];
						for ( r = 0, o = s.length; r < o; r++) {
							t = s[r];
							n.cloudcache[t.title] = {
								id : t.title,
								time : t.modifiedDate
							};
							if (t.labels.trashed) {
								u.push(console.log("##### this is trashed #####", t))
							} else {
								u.push(
								void 0)
							}
						}
						return u
					} else {
						return log("###ERROR, no return data")
					}
				};
				return Nimbus.Client.GDrive.getMetadataList("'" + t + "' in parents", e)
			} else {
				return log("############################BIG ERROR no folder there for load from cloud")
			}
		},
		get_delta : function() {
			return log("get the delta for ", this.name, " since last synced")
		},
		extended : function() {
			this.sync(this.proxy(this.real_time_sync));
			return this.fetch(this.proxy(this.loadLocal))
		}
	};
	window.folder = null;
	window.folder_creation = new l;
	window.creating = {};
	window.handle_initialization = new l;
	window.gdrive_initialized = false;
	window.folder_initialize = function(e) {
		log("&&& folder initialize");
		log("Nimbus.Client.GDrive.check_auth()", Nimbus.Client.GDrive.check_auth(), "Nimbus.Auth.service", Nimbus.Auth.service);
		if (Nimbus.Client.GDrive.check_auth() && Nimbus.Auth.service === "GDrive") {
			log("this is authenticated and a GDrive app");
			return Nimbus.Client.GDrive.getMetadataList("mimeType = 'application/vnd.google-apps.folder'", function(t) {
				var i, n, r, o, s, u;
				log("#data: ", t);
				if (window.folder === null) {
					window.folder = {}
				}
				i = t.items;
				if (localStorage["main_folder_id"] != null) {
					window.folder[Nimbus.Auth.app_name] = {
						title : Nimbus.Auth.app_name,
						id : localStorage["main_folder_id"]
					}
				} else {
					for ( r = 0, s = i.length; r < s; r++) {
						n = i[r];
						if (n.title === Nimbus.Auth.app_name) {
							window.folder[n.title] = n
						}
					}
				}
				if (!(window.folder[Nimbus.Auth.app_name] != null)) {
					window.folder = {};
					if (e != null) {
						return Nimbus.Client.GDrive.insertFile("", Nimbus.Auth.app_name, "application/vnd.google-apps.folder", null, function(t) {
							log("folder data", t);
							window.folder[t.title] = t;
							if (e != null) {
								return e()
							}
						})
					} else {
						return Nimbus.Client.GDrive.insertFile("", Nimbus.Auth.app_name, "application/vnd.google-apps.folder")
					}
				} else {
					log("base folder there: ", window.folder[Nimbus.Auth.app_name].id);
					for ( o = 0, u = i.length; o < u; o++) {
						n = i[o];
						log(n);
						if (n.parents.length > 0 && n.parents[0].id === window.folder[Nimbus.Auth.app_name].id) {
							window.folder[n.title] = n
						}
					}
					if (e != null) {
						return e()
					}
				}
			})
		}
	};
	window.model_initialize = function(e) {
		log("initialized model", e);
		log("#loaded", window.loaded, window.gdrive_initialized);
		if (!window.loaded || !Nimbus.Client.GDrive.check_auth()) {
			log("initialization called later");
			window.handle_initialization.add_call(function() {
				return window.model_initialize(e)
			});
			return
		}
		if (window.folder === null) {
			log("window.folder object not present");
			log("#folder creation is running", window.folder_creation.running);
			if (window.creating[e.name] == null) {
				window.creating[e.name] = true;
				if (window.folder_creation.running === false) {
					window.folder_initialize(function() {
						return window.folder_creation.execute_callback()
					})
				}
				return window.folder_creation.add_call(function() {
					log("THE CALLBACK IS CALLED", "model.name exists", window.folder[e.name] != null);
					if (window.folder[e.name] == null) {
						return Nimbus.Client.GDrive.insertFile("", e.name, "application/vnd.google-apps.folder", window.folder[Nimbus.Auth.app_name].id, function(e) {
							return window.folder[e.title] = e
						})
					}
				})
			}
		} else {
			if (window.folder[e.name] != null) {
				return log("model folder there")
			} else {
				log("creating model folder for", e.name);
				return Nimbus.Client.GDrive.insertFile("", e.name, "application/vnd.google-apps.folder", window.folder[Nimbus.Auth.app_name].id, function(e) {
					return window.folder[e.title] = e
				})
			}
		}
	};
	Nimbus.Auth.GDrive = {
		get_token_from_code : function(e) {
			var t, i, n = this;
			i = new XMLHttpRequest;
			t = "code=" + e + "&client_id=" + this.key + "&client_secret=" + this.client_secret + "&grant_type=authorization_code&redirect_uri=urn%3Aietf%3Awg%3Aoauth%3A2.0%3Aoob";
			window.data = t;
			i.open("POST", "https://accounts.google.com/o/oauth2/token");
			i.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			i.onreadystatechange = function(e, t) {
				if (i.readyState === 4) {
					try {
						console.log("xhr", i);
						console.log("TOKEN RETRIEVAL LOGGED");
						return console.log("response: ", i.response)
					} catch(n) {
					}
				}
			};
			i.send(t);
			return window.xhr = i
		},
		authenticate_gdrive : function() {
			var t, i;
			log("this should bring up a prompt to initialize into GDrive");
			localStorage["d_key"] = this.key;
			localStorage["secret"] = this.secret;
			localStorage["state"] = "Auth";
			if (document.URL.slice(0, 4) === "file" && ( typeof cordova !== "undefined" && cordova !== null)) {
				log("Phonegap google login");
				t = "https://accounts.google.com/o/oauth2/auth?response_type=token&client_id=" + this.key + "&scope=" + this.secret + "&approval_prompt=auto&redirect_uri=http%3A%2F%2Fnimbusbase.com";
				console.log(t);
				window.auth_url = t;
				i = window.open(t, "_blank", "location=yes");
				window.ref = i;
				i.addEventListener("loadstop", function(t) {
					var i, n = this;
					console.log(t);
					console.log("event", t.url.indexOf("http://nimbusbase.com/"));
					if (t.url.indexOf("http://nimbusbase.com/") >= 0) {
						i = t.url.split("access_token=")[1].split("&token_type")[0];
						gapi.auth.setToken({
							access_token : i,
							scope : "https://www.googleapis.com/auth/drive",
							client_id : localStorage["d_key"]
						});
						if (Nimbus.Auth.authorized_callback != null) {
							Nimbus.Auth.authorized_callback()
						}
						window.current_syncing = new e(function() {
							log("CURRENT SYNCING CALLBACK");
							return Nimbus.Auth.app_ready_func()
						});
						if (window.handle_initialization != null) {
							window.handle_initialization.execute_callback()
						}
						window.current_syncing.ready();
						return window.ref.close()
					}
				});
				return i.addEventListener("exit", function(e) {
					return Nimbus.Auth.logout_gdrive()
				})
			} else {
				return gapi.auth.authorize({
					client_id : this.key,
					scope : this.secret,
					immediate : false
				}, function(t) {
					var i = this;
					log("client load handled GDrive");
					log(t);
					if (t !== null) {
						if (Nimbus.Auth.authorized_callback != null) {
							Nimbus.Auth.authorized_callback()
						}
						window.current_syncing = new e(function() {
							log("CURRENT SYNCING CALLBACK");
							return Nimbus.Auth.app_ready_func()
						});
						if (window.handle_initialization != null) {
							window.handle_initialization.execute_callback()
						}
						return window.current_syncing.ready()
					}
				})
			}
		},
		initialize_gdrive : function() {
			log("This part should reflect what initialization needs to be done for GDrive auth");
			window.gdrive_initialized = true;
			if (window.loaded) {
				console.log("GDrive loaded");
				gapi.auth.init();
				return gapi.auth.authorize({
					client_id : this.key,
					scope : this.secret,
					immediate : true
				}, function(t) {
					var i = this;
					log("client load handled GDrive");
					log(t);
					if (t !== null) {
						if (Nimbus.Auth.authorized_callback != null) {
							Nimbus.Auth.authorized_callback()
						}
						window.current_syncing = new e(function() {
							log("CURRENT SYNCING CALLBACK");
							return Nimbus.Auth.app_ready_func()
						});
						if (window.handle_initialization != null) {
							window.handle_initialization.execute_callback()
						}
						return window.current_syncing.ready()
					}
				})
			}
		},
		gdrive_authorized : function() {
			return Nimbus.Client.GDrive.check_auth()
		},
		logout_gdrive : function(e) {
			var t, i, n;
			localStorage.clear();
			gapi.auth.setToken(null);
			if (Nimbus.dictModel != null) {
				n = Nimbus.dictModel;
				for (t in n) {
					i = n[t];
					i.records = {}
				}
			}
			if (this.sync_services != null) {
				Nimbus.Auth.setup(this.sync_services)
			}
			if (e != null) {
				return e()
			}
		}
	};
	Nimbus.Auth.Multi = {
		authenticate_service : function(e) {
			var t, i, n, r;
			log("authenticate a single service", e);
			if (this.sync_services != null && this.sync_services[e] != null) {
				n = this.sync_services[e];
				if (e === "Dropbox") {
					Nimbus.Auth.setup(e, n.key, n.secret, n.app_name)
				}
				if (n.client_secret != null) {
					if (e === "GDrive") {
						Nimbus.Auth.setup(e, n.key, n.scope, n.app_name, n.client_secret)
					}
				} else {
					if (e === "GDrive") {
						Nimbus.Auth.setup(e, n.key, n.scope, n.app_name)
					}
				}
				r = Nimbus.dictModel;
				for (t in r) {
					i = r[t];
					Nimbus.Model.service_setup(i)
				}
				return Nimbus.Auth.authorize()
			}
		},
		initialize_service : function() {
			return log("initializing service")
		}
	};
	Nimbus.Auth.reinitialize();
	Nimbus.backbone_store = function(e, t) {
		var i, n, r, o, s, u, a;
		log("Model on creation", t);
		this.name = e;
		r = new t;
		n = [];
		a = r.attributes;
		for (i in a) {
			u = a[i];
			n.push(i)
		}
		o = Nimbus.Model.setup(e, n);
		s = o;
		this.data = o.all() || {};
		return s
	};
	Nimbus.backbone_sync = function(e, t, i) {
		var n, r, o, s;
		r =
		void 0;
		s = t.nimbus || t.collection.nimbus;
		window.model = t;
		switch(e) {
			case"read":
				r = t.id ? s.find(t) : s.all();
				break;
			case"create":
				console.log("create called");
				n = s.init(t.attributes);
				n.id = t.id;
				n.save();
				r = n;
				break;
			case"update":
				o = s.find(t.id);
				o.updateAttributes(t.attributes);
				o.save();
				r = o;
				break;
			case"delete":
				console.log("deletion find", s.find(t.id));
				r = s.find(t.id).destroy()
		}
		if (r) {
			return i.success(r)
		} else {
			return i.error("Record not found")
		}
	}
}).call(this); 