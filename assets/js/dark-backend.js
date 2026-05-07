(function () {
  "use strict";

  var tokenKey = "instac_dark_token";
  var userKey = "instac_dark_user";
  var apiBase = window.location.protocol === "file:" ? "http://localhost:3000" : "";
  var state = {
    user: null,
    chats: [],
    currentChatId: null,
  };

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function api(path, options) {
    options = options || {};
    var headers = options.headers || {};
    headers["Content-Type"] = "application/json";

    var token = localStorage.getItem(tokenKey);
    if (token) {
      headers.Authorization = "Bearer " + token;
    }

    return fetch(apiBase + path, {
      method: options.method || "GET",
      headers: headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    }).then(function (response) {
      return response.json().then(function (data) {
        if (!response.ok) {
          throw new Error(data.error || "خطا در ارتباط با سرور");
        }
        return data;
      });
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function showMessage(form, text, type) {
    var box = form.querySelector("[data-backend-message]");
    if (!box) {
      box = document.createElement("div");
      box.setAttribute("data-backend-message", "");
      form.insertBefore(box, form.firstChild);
    }
    box.className = "alert alert-" + (type || "info") + " text-right";
    box.textContent = text;
  }

  function saveSession(data) {
    localStorage.setItem(tokenKey, data.token);
    localStorage.setItem(userKey, JSON.stringify(data.user));
  }

  function clearSession() {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
  }

  function getSigninPath() {
    return window.location.pathname.indexOf("/light-skin/") !== -1
      ? "../light-skin/signin.html"
      : "../dark-skin/signin.html";
  }

  function getChatPagePath(chatId) {
    return "chat-1.html?chat=" + encodeURIComponent(chatId);
  }

  function getChatId() {
    var params = new URLSearchParams(window.location.search);
    var chat = params.get("chat");
    if (chat) {
      state.currentChatId = chat;
    }
    return state.currentChatId;
  }

  function setCurrentChat(chatId, replace) {
    state.currentChatId = chatId || null;
    var url = chatId ? getChatPagePath(chatId) : "chat-1.html";
    if (replace) {
      history.replaceState(null, "", url);
    }
  }

  function persianTime(value) {
    if (!value) {
      return "";
    }
    return new Intl.DateTimeFormat("fa-IR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  }

  function splitName(name) {
    var parts = String(name || "").trim().split(/\s+/).filter(Boolean);
    return {
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" "),
    };
  }

  function setValue(selector, value) {
    var element = qs(selector);
    if (element) {
      element.value = value || "";
    }
  }

  function setText(element, value) {
    if (element) {
      element.textContent = value || "";
    }
  }

  function ensureProfileIdRow(profile, user) {
    var list = profile.querySelector(".card.mt-3 .list-group");
    if (!list) {
      return;
    }

    var row = profile.querySelector("[data-profile-user-id-row]");
    if (!row) {
      row = document.createElement("li");
      row.className = "list-group-item py-2";
      row.setAttribute("data-profile-user-id-row", "");
      row.innerHTML =
        '<div class="media align-items-center"><div class="media-body">' +
        '<p class="small text-muted mb-0">آیدی</p>' +
        '<p class="mb-0" dir="ltr" data-profile-user-id></p>' +
        "</div></div>";
      list.insertBefore(row, list.firstChild);
    }

    setText(row.querySelector("[data-profile-user-id]"), user.username ? "@" + user.username : "");
  }

  function ensureProfileIdInput() {
    if (qs("#userId")) {
      return;
    }

    var firstName = qs("#firstName");
    var row = firstName ? firstName.closest(".row") : null;
    if (!row) {
      return;
    }

    var col = document.createElement("div");
    col.className = "col-md-6 col-12";
    col.innerHTML =
      '<div class="form-group"><label for="userId">آیدی</label>' +
      '<input type="text" class="form-control form-control-md" id="userId" readonly dir="ltr">' +
      "</div>";
    row.insertBefore(col, row.firstChild);
  }

  function applyCurrentUser(user) {
    state.user = user;
    localStorage.setItem(userKey, JSON.stringify(user));

    var profile = qs("#profile-content");
    if (profile) {
      var title = profile.querySelector(".card-bg-5 h5");
      ensureProfileIdRow(profile, user);
      setText(title, user.name || user.email || "کاربر");

      qsa(".list-group-item", profile).forEach(function (row) {
        var label = row.querySelector(".small");
        var value = row.querySelector(".media-body p.mb-0, .media-body a");
        if (!label || !value) {
          return;
        }

        var labelText = label.textContent.trim();
        if (labelText === "پست الکترونیک") {
          setText(value, user.email);
        } else if (["تلفن", "سایت اینترنتی", "نشانی", "تاریخ تولد"].indexOf(labelText) !== -1) {
          setText(value, "ثبت نشده");
        }
      });
    }

    var names = splitName(user.name);
    ensureProfileIdInput();
    setValue("#firstName", names.firstName);
    setValue("#lastName", names.lastName);
    setValue("#userId", user.username);
    setValue("#emailAddress", user.email);
    setValue("#mobileNumber", "");
    setValue("#birthDate", "");
    setValue("#webSite", "");
    setValue("#Address", "");
  }

  function loadCurrentUser(options) {
    options = options || {};
    return api("/api/me")
      .then(function (data) {
        applyCurrentUser(data.user);
        return data.user;
      })
      .catch(function (error) {
        if (options.redirectOnFail) {
          clearSession();
          window.location.href = getSigninPath();
        }
        throw error;
      });
  }

  function wireAuth() {
    var path = window.location.pathname;
    var form = qs(".authentication-page form");
    if (!form) {
      return;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var email = qs("#email", form) ? qs("#email", form).value.trim() : "";
      var password = qs("#password", form) ? qs("#password", form).value : "";
      var name = qs("#name", form) ? qs("#name", form).value.trim() : "";
      var endpoint = "/api/auth/signin";
      var payload = { email: email, password: password };

      if (path.indexOf("signup") !== -1) {
        endpoint = "/api/auth/signup";
        payload.name = name;
      } else if (path.indexOf("reset-password") !== -1) {
        endpoint = "/api/auth/reset-password";
        payload = { email: email };
      }

      showMessage(form, "در حال ارسال...", "info");
      api(endpoint, { method: "POST", body: payload })
        .then(function (data) {
          if (data.token) {
            saveSession(data);
            window.location.href = "chat-1.html";
            return;
          }
          showMessage(form, data.message || "درخواست ثبت شد.", "success");
        })
        .catch(function (error) {
          showMessage(form, error.message, "danger");
        });
    });
  }

  function wireLogout() {
    qsa("#profile-content button").forEach(function (button) {
      if (button.dataset.backendLogoutWired) {
        return;
      }
      if (button.textContent.trim().indexOf("خروج") !== -1) {
        button.dataset.backendLogoutWired = "1";
        button.addEventListener("click", function () {
          clearSession();
          window.location.href = getSigninPath();
        });
      }
    });
  }

  function getMessageContainer() {
    var finished = qs(".chat-finished");
    return finished ? finished.parentNode : null;
  }

  function clearMessages() {
    var container = getMessageContainer();
    var finished = qs(".chat-finished");
    if (!container || !finished) {
      return;
    }

    qsa(":scope > *", container).forEach(function (child) {
      if (child !== finished) {
        child.remove();
      }
    });
  }

  function showEmptyMessages(text) {
    var container = getMessageContainer();
    var finished = qs(".chat-finished");
    if (!container || !finished) {
      return;
    }

    clearMessages();
    var empty = document.createElement("div");
    empty.className = "text-muted text-center py-5";
    empty.textContent = text;
    container.insertBefore(empty, finished);
  }

  function renderMessage(message) {
    var wrapper = document.createElement("div");
    wrapper.className = "message" + (message.self ? " self" : "");
    wrapper.setAttribute("data-backend-message-id", message.id);
    wrapper.innerHTML =
      '<div class="message-wrapper"><div class="message-content">' +
      (message.self ? "" : '<h6 class="text-dark">' + escapeHtml(message.author) + "</h6>") +
      "<span>" +
      escapeHtml(message.text) +
      "</span></div></div>" +
      '<div class="message-options"><div class="avatar avatar-sm"><img alt="" src="../assets/media/avatar/' +
      (message.self ? "6" : "3") +
      '.png"></div><span class="message-date">' +
      escapeHtml(persianTime(message.createdAt)) +
      "</span></div>";
    return wrapper;
  }

  function appendMessage(message) {
    var finished = qs(".chat-finished");
    if (!finished || qs('[data-backend-message-id="' + message.id + '"]')) {
      return;
    }
    finished.parentNode.insertBefore(renderMessage(message), finished);
    finished.scrollIntoView({ block: "end", behavior: "smooth" });
  }

  function renderChatItem(chat) {
    var item = document.createElement("li");
    var active = chat.id === getChatId();
    item.className = "contacts-item friends" + (active ? " active" : "");
    var last = chat.lastMessage;
    var preview = last ? (last.author ? last.author + ": " : "") + last.text : "هنوز پیامی وجود ندارد.";

    item.innerHTML =
      '<a class="contacts-link" href="' +
      getChatPagePath(chat.id) +
      '"><div class="avatar avatar-online"><img src="' +
      escapeHtml(chat.avatar || "../assets/media/avatar/3.png") +
      '" alt=""></div><div class="contacts-content"><div class="contacts-info"><h6 class="chat-name text-truncate">' +
      escapeHtml(chat.name) +
      '</h6><div class="chat-time">' +
      escapeHtml(persianTime(last && last.createdAt)) +
      '</div></div><div class="contacts-texts"><p class="text-truncate">' +
      escapeHtml(preview) +
      "</p></div></div></a>";
    return item;
  }

  function renderChatList(chats) {
    var list = qs("#chatContactTab");
    if (!list) {
      return;
    }

    list.innerHTML = "";
    if (chats.length === 0) {
      list.innerHTML = '<li class="contacts-item"><div class="p-3 text-muted text-center">هیچ چتی وجود ندارد. از «چت جدید» گفتگو بسازید.</div></li>';
      return;
    }

    chats.forEach(function (chat) {
      list.appendChild(renderChatItem(chat));
    });
  }

  function updateChatHeader() {
    var current = state.chats.filter(function (chat) {
      return chat.id === getChatId();
    })[0];
    var name = qs(".chat-header .chat-name h6");
    var subtitle = qs(".chat-header .chat-name small");

    if (!current) {
      setText(name, "چتی انتخاب نشده");
      setText(subtitle, "برای شروع، یک کاربر را جستجو کنید");
      return;
    }

    setText(name, current.name);
    setText(subtitle, "گفتگوی خصوصی");
  }

  function loadChats() {
    return api("/api/chats").then(function (data) {
      state.chats = data.chats || [];

      if (!getChatId() && state.chats.length > 0) {
        setCurrentChat(state.chats[0].id, true);
      }

      if (getChatId() && !state.chats.some(function (chat) { return chat.id === getChatId(); })) {
        setCurrentChat(state.chats.length > 0 ? state.chats[0].id : null, true);
      }

      renderChatList(state.chats);
      updateChatHeader();
      return state.chats;
    });
  }

  function loadMessages() {
    var chatId = getChatId();
    if (!chatId) {
      showEmptyMessages("هنوز هیچ چتی ندارید. از «چت جدید» یک کاربر را پیدا کنید.");
      return Promise.resolve([]);
    }

    clearMessages();
    return api("/api/messages?chat=" + encodeURIComponent(chatId))
      .then(function (data) {
        if (!data.messages || data.messages.length === 0) {
          showEmptyMessages("هنوز پیامی در این گفتگو وجود ندارد.");
          return [];
        }

        data.messages.forEach(appendMessage);
        return data.messages;
      })
      .catch(function (error) {
        showEmptyMessages(error.message);
        return [];
      });
  }

  function filterChatList(query) {
    var normalized = String(query || "").trim().toLowerCase();
    qsa("#chatContactTab .contacts-item").forEach(function (item) {
      item.style.display = item.textContent.toLowerCase().indexOf(normalized) === -1 ? "none" : "";
    });
  }

  function renderUserResult(user) {
    var item = document.createElement("li");
    item.className = "list-group-item";
    item.innerHTML =
      '<button type="button" class="btn btn-link text-reset p-0 w-100 text-right' +
      (user.isSelf ? " disabled" : "") +
      '" data-user-id="' +
      escapeHtml(user.id) +
      '" data-is-self="' +
      (user.isSelf ? "1" : "0") +
      '"><div class="media"><div class="avatar avatar-online mr-2"><img src="' +
      escapeHtml(user.avatar || "../assets/media/avatar/3.png") +
      '" alt=""></div><div class="media-body"><h6 class="text-truncate mb-1">' +
      escapeHtml(user.name || user.email) +
      '</h6><p class="text-muted mb-0" dir="ltr">' +
      escapeHtml(user.isSelf ? "این حساب خود شماست" : user.email) +
      '</p><p class="text-muted mb-0 small" dir="ltr">' +
      escapeHtml(user.id) +
      "</p></div></div></button>";
    return item;
  }

  function setSearchState(list, text) {
    list.innerHTML = '<li class="list-group-item text-muted text-center">' + escapeHtml(text) + "</li>";
  }

  function openChatWithUser(userId) {
    api("/api/chats", {
      method: "POST",
      body: { userId: userId },
    })
      .then(function (data) {
        window.location.href = getChatPagePath(data.chat.id);
      })
      .catch(function (error) {
        alert(error.message);
      });
  }

  function wireUserSearch() {
    var sidebarSearch = qs("#chats-content .sidebar-sub-header input.search");
    if (sidebarSearch && !sidebarSearch.dataset.backendSearchWired) {
      sidebarSearch.dataset.backendSearchWired = "1";
      sidebarSearch.addEventListener("input", function () {
        filterChatList(sidebarSearch.value);
      });
    }

    var modal = qs("#startConversation");
    if (!modal || modal.dataset.backendSearchWired) {
      return;
    }
    modal.dataset.backendSearchWired = "1";

    var input = qs("input.search", modal);
    var list = qs(".list-group", modal);
    var form = qs("form", modal);
    var searchButton = qs(".input-group-text", modal);
    var timer = null;

    if (!input || !list) {
      return;
    }

    setSearchState(list, "برای پیدا کردن کاربر، نام، ایمیل یا آی‌دی را وارد کنید.");

    function runSearch() {
      var query = input.value.trim();
      clearTimeout(timer);

      if (query.length < 2) {
        setSearchState(list, "حداقل ۲ کاراکتر وارد کنید.");
        return;
      }

      setSearchState(list, "در حال جستجو...");
      api("/api/users/search?q=" + encodeURIComponent(query))
        .then(function (data) {
          list.innerHTML = "";
          if (!data.users || data.users.length === 0) {
            setSearchState(list, "کاربری پیدا نشد.");
            return;
          }

          data.users.forEach(function (user) {
            list.appendChild(renderUserResult(user));
          });
        })
        .catch(function (error) {
          setSearchState(list, error.message);
        });
    }

    input.addEventListener("input", function () {
      clearTimeout(timer);
      timer = setTimeout(runSearch, 250);
    });

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        runSearch();
      });
    }

    if (searchButton) {
      searchButton.addEventListener("click", runSearch);
    }

    list.addEventListener("click", function (event) {
      var button = event.target.closest("[data-user-id]");
      if (!button) {
        return;
      }
      if (button.getAttribute("data-is-self") === "1") {
        alert("این حساب خود شماست. ایمیل حساب دیگر را سرچ کنید.");
        return;
      }
      openChatWithUser(button.getAttribute("data-user-id"));
    });
  }

  function renderUserList(users) {
    var list = qs("#friendsTab");
    if (!list) {
      return;
    }

    list.innerHTML = "";
    if (users.length === 0) {
      list.innerHTML = '<li class="contacts-item"><div class="p-3 text-muted text-center">کاربر دیگری ثبت نشده است.</div></li>';
      return;
    }

    users.forEach(function (user) {
      var item = document.createElement("li");
      item.className = "contacts-item friends";
      item.innerHTML =
        '<button type="button" class="contacts-link border-0 bg-transparent w-100 text-right" data-user-id="' +
        escapeHtml(user.id) +
        '"><div class="avatar avatar-online"><img src="' +
        escapeHtml(user.avatar || "../assets/media/avatar/3.png") +
        '" alt=""></div><div class="contacts-content"><div class="contacts-info"><h6 class="chat-name text-truncate">' +
        escapeHtml(user.name || user.email) +
        '</h6></div><div class="contacts-texts"><p class="text-truncate" dir="ltr">' +
        escapeHtml(user.email) +
        "</p></div></div></button>";
      list.appendChild(item);
    });

    list.addEventListener("click", function (event) {
      var button = event.target.closest("[data-user-id]");
      if (button) {
        openChatWithUser(button.getAttribute("data-user-id"));
      }
    });
  }

  function loadUsers() {
    return api("/api/users")
      .then(function (data) {
        renderUserList(data.users || []);
        return data.users || [];
      })
      .catch(function () {
        renderUserList([]);
        return [];
      });
  }

  function clearDemoLists() {
    var callList = qs("#callLogTab");
    if (callList) {
      callList.innerHTML = '<li class="contacts-item"><div class="p-3 text-muted text-center">تماسی ثبت نشده است.</div></li>';
    }
  }

  function wireChat() {
    var chatContent = qs(".chat-content");
    var form = qs(".chat-footer form");
    if (!chatContent || !form) {
      return;
    }

    clearDemoLists();
    clearMessages();
    wireLogout();
    wireUserSearch();

    loadCurrentUser({ redirectOnFail: true })
      .then(function () {
        return Promise.all([loadChats(), loadUsers()]);
      })
      .then(function () {
        return loadMessages();
      })
      .catch(function () {});

    var textarea = qs("textarea", form);
    var sendButton = qs(".btn-primary[role='button']", form);

    function submitMessage() {
      var chatId = getChatId();
      var text = textarea ? textarea.value.trim() : "";
      if (!chatId) {
        alert("اول یک چت بسازید یا انتخاب کنید.");
        return;
      }
      if (!text) {
        return;
      }

      textarea.value = "";
      api("/api/messages", {
        method: "POST",
        body: { chat: chatId, text: text },
      })
        .then(function (data) {
          appendMessage(data.message);
          return loadChats();
        })
        .catch(function (error) {
          textarea.value = text;
          alert(error.message);
        });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      submitMessage();
    });

    if (sendButton) {
      sendButton.addEventListener("click", submitMessage);
    }

    if (textarea) {
      textarea.addEventListener("keydown", function (event) {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          submitMessage();
        }
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    wireAuth();
    wireChat();
    wireLogout();
    wireUserSearch();

    var cachedUser = localStorage.getItem(userKey);
    if (cachedUser) {
      try {
        applyCurrentUser(JSON.parse(cachedUser));
      } catch (error) {}
    }

    if (qs("#profile-content") && !qs(".chat-content")) {
      loadCurrentUser().catch(function () {});
    }
  });
})();
