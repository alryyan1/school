var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
function Dialog(_a) {
    var props = __rest(_a, []);
    return _jsx(DialogPrimitive.Root, __assign({ "data-slot": "dialog" }, props));
}
function DialogTrigger(_a) {
    var props = __rest(_a, []);
    return _jsx(DialogPrimitive.Trigger, __assign({ "data-slot": "dialog-trigger" }, props));
}
function DialogPortal(_a) {
    var props = __rest(_a, []);
    return _jsx(DialogPrimitive.Portal, __assign({ "data-slot": "dialog-portal" }, props));
}
function DialogClose(_a) {
    var props = __rest(_a, []);
    return _jsx(DialogPrimitive.Close, __assign({ "data-slot": "dialog-close" }, props));
}
function DialogOverlay(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (_jsx(DialogPrimitive.Overlay, __assign({ "data-slot": "dialog-overlay", className: cn("data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50", className) }, props)));
}
function DialogContent(_a) {
    var className = _a.className, children = _a.children, props = __rest(_a, ["className", "children"]);
    return (_jsxs(DialogPortal, { "data-slot": "dialog-portal", children: [_jsx(DialogOverlay, {}), _jsxs(DialogPrimitive.Content, __assign({ "data-slot": "dialog-content", className: cn("bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg md:max-w-xl", className) }, props, { children: [children, _jsxs(DialogPrimitive.Close, { className: "ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", children: [_jsx(XIcon, {}), _jsx("span", { className: "sr-only", children: "Close" })] })] }))] }));
}
function DialogHeader(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (_jsx("div", __assign({ "data-slot": "dialog-header", className: cn("flex flex-col gap-2 text-center sm:text-left", className) }, props)));
}
function DialogFooter(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (_jsx("div", __assign({ "data-slot": "dialog-footer", className: cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className) }, props)));
}
function DialogTitle(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (_jsx(DialogPrimitive.Title, __assign({ "data-slot": "dialog-title", className: cn("text-lg leading-none font-semibold", className) }, props)));
}
function DialogDescription(_a) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (_jsx(DialogPrimitive.Description, __assign({ "data-slot": "dialog-description", className: cn("text-muted-foreground text-sm", className) }, props)));
}
export { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger, };
