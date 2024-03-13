// headerボタンに渡す引数(dict)
export const headerButton = {
    buttonType: "headerButton",
    class     : "header",
    text      : ["Create Task", "Invitation", "Other"],
    endpoint  : ["/create_task", "/invitation", "/other"]
};

// logoutボタンに渡す引数(dict)
// Detailボタンと似ているので後で工夫してシンプルにする
export const logoutButton = {
    buttonType: "logoutButton",
    class     : "logout",
    text      : "Logout",
};

// detailボタンに渡す引数(dict)
export const detailButton = {
    buttonType: "detail",
    class     : "detail",
    text      : "Detail",
};