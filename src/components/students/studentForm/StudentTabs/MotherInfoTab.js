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
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useFormContext } from 'react-hook-form';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validateArabicName, validatePhoneNumber } from '@/utils/validators';
export var MotherInfoTab = function () {
    var _a = useFormContext(), register = _a.register, errors = _a.formState.errors;
    return (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "mother_name", children: "\u0627\u0633\u0645 \u0627\u0644\u0623\u0645 *" }), _jsx(Input, __assign({ id: "mother_name" }, register("mother_name", {
                        required: "اسم الأم مطلوب",
                        validate: {
                            arabicName: validateArabicName,
                            minLength: function (v) { return v.length >= 3 || "يجب أن يكون الاسم 3 أحرف على الأقل"; }
                        }
                    }), { className: errors.mother_name ? "border-red-500" : "" })), errors.mother_name && (_jsx("p", { className: "text-sm text-red-500", children: errors.mother_name.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "mother_job", children: "\u0648\u0638\u064A\u0641\u0629 \u0627\u0644\u0623\u0645 *" }), _jsx(Input, __assign({ id: "mother_job" }, register("mother_job", {
                        required: "وظيفة الأم مطلوبة",
                    }), { className: errors.mother_job ? "border-red-500" : "" })), errors.mother_job && (_jsx("p", { className: "text-sm text-red-500", children: errors.mother_job.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "mother_address", children: "\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0623\u0645 *" }), _jsx(Input, __assign({ id: "mother_address" }, register("mother_address", {
                        required: "عنوان الأم مطلوب",
                    }), { className: errors.mother_address ? "border-red-500" : "" })), errors.mother_address && (_jsx("p", { className: "text-sm text-red-500", children: errors.mother_address.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "mother_phone", children: "\u0631\u0642\u0645 \u0647\u0627\u062A\u0641 \u0627\u0644\u0623\u0645 *" }), _jsx(Input, __assign({ id: "mother_phone", type: "tel" }, register("mother_phone", {
                        required: "رقم الهاتف مطلوب",
                        validate: validatePhoneNumber
                    }), { className: errors.mother_phone ? "border-red-500" : "" })), errors.mother_phone && (_jsx("p", { className: "text-sm text-red-500", children: errors.mother_phone.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "mother_whatsapp", children: "\u0648\u0627\u062A\u0633\u0627\u0628 \u0627\u0644\u0623\u0645" }), _jsx(Input, __assign({ id: "mother_whatsapp", type: "tel" }, register("mother_whatsapp", {
                        validate: function (value) {
                            return !value || validatePhoneNumber(value) || "رقم واتساب غير صحيح";
                        }
                    }), { className: errors.mother_whatsapp ? "border-red-500" : "" })), errors.mother_whatsapp && (_jsx("p", { className: "text-sm text-red-500", children: errors.mother_whatsapp.message }))] })] }));
};
