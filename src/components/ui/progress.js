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
import { jsx as _jsx } from "react/jsx-runtime";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";
function Progress(_a) {
    var className = _a.className, value = _a.value, props = __rest(_a, ["className", "value"]);
    return (_jsx(ProgressPrimitive.Root, __assign({ "data-slot": "progress", className: cn("bg-primary/20 relative h-2 w-full overflow-hidden rounded-full", className) }, props, { children: _jsx(ProgressPrimitive.Indicator, { "data-slot": "progress-indicator", className: "bg-primary h-full w-full flex-1 transition-all", style: { transform: "translateX(-".concat(100 - (value || 0), "%)") } }) })));
}
export { Progress };
