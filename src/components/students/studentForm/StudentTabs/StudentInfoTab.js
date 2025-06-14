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
import { Controller, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { EducationLevel, Gender } from "@/types/student";
import dayjs from "dayjs";
export var StudentInfoTab = function () {
    var _a = useFormContext(), control = _a.control, register = _a.register, errors = _a.formState.errors;
    return (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "student_name", children: "\u0627\u0633\u0645 \u0627\u0644\u0637\u0627\u0644\u0628 \u0631\u0628\u0627\u0639\u064A *" }), _jsx(Input, __assign({ id: "student_name" }, register("student_name", {
                        required: {
                            value: true,
                            message: "اسم الطالب مطلوب",
                        },
                        validate: {
                            minWords: function (value) {
                                var words = value
                                    .trim()
                                    .split(/\s+/)
                                    .filter(function (word) { return word.length > 0; });
                                return (words.length >= 4 ||
                                    "يجب إدخال الاسم الرباعي (4 كلمات على الأقل)");
                            },
                        },
                    }), { className: errors.student_name ? "border-red-500" : "" })), errors.student_name && (_jsx("p", { className: "text-sm text-red-500", children: errors.student_name.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "date_of_birth", children: "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0645\u064A\u0644\u0627\u062F *" }), _jsx(Controller, { name: "date_of_birth", control: control, rules: {
                            required: "تاريخ الميلاد مطلوب",
                            validate: function (value) {
                                var date = dayjs(value);
                                var today = dayjs();
                                if (date.isAfter(today)) {
                                    return "تاريخ الميلاد لا يمكن أن يكون في المستقبل";
                                }
                                if (today.diff(date, "year") < 3) {
                                    return "الطالب يجب أن يكون عمره أكثر من 3 سنوات";
                                }
                                return true;
                            },
                        }, render: function (_a) {
                            var field = _a.field;
                            return (_jsxs("div", { children: [_jsx(Input, __assign({ id: "date_of_birth", type: "date" }, field, { value: field.value || "", className: errors.date_of_birth ? "border-red-500" : "" })), errors.date_of_birth && (_jsx("p", { className: "text-sm text-red-500 mt-1", children: errors.date_of_birth.message }))] }));
                        } })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "gender", children: "\u0627\u0644\u062C\u0646\u0633 *" }), _jsx(Controller, { control: control, name: "gender", render: function (_a) {
                            var field = _a.field;
                            return (_jsxs(Select, { value: field.value, onValueChange: field.onChange, children: [_jsx(SelectTrigger, { className: errors.gender ? "border-red-500" : "", children: _jsx(SelectValue, { placeholder: "\u0627\u062E\u062A\u0631 \u0627\u0644\u062C\u0646\u0633" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: Gender.Male, children: Gender.Male }), _jsx(SelectItem, { value: Gender.Female, children: Gender.Female })] })] }));
                        } }), errors.gender && (_jsx("p", { className: "text-sm text-red-500", children: errors.gender.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "wished_level", children: "\u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u062F\u0631\u0627\u0633\u064A\u0629 \u0627\u0644\u0645\u0631\u063A\u0648\u0628\u0629 *" }), _jsx(Controller, { name: "wished_level", control: control, render: function (_a) {
                            var field = _a.field;
                            return (_jsxs(Select, { value: field.value, onValueChange: field.onChange, children: [_jsx(SelectTrigger, { className: errors.wished_level ? "border-red-500" : "", children: _jsx(SelectValue, { placeholder: "\u0627\u062E\u062A\u0631 \u0627\u0644\u0645\u0631\u062D\u0644\u0629" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: EducationLevel.Secondary, children: EducationLevel.Secondary }), _jsx(SelectItem, { value: EducationLevel.Intermediate, children: EducationLevel.Intermediate }), _jsx(SelectItem, { value: EducationLevel.Primary, children: EducationLevel.Primary }), _jsx(SelectItem, { value: EducationLevel.Kindergarten, children: EducationLevel.Kindergarten })] })] }));
                        } }), errors.wished_level && (_jsx("p", { className: "text-sm text-red-500", children: errors.wished_level.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "medical_condition", children: "\u0627\u0644\u062D\u0627\u0644\u0629 \u0627\u0644\u0635\u062D\u064A\u0629" }), _jsx(Input, __assign({ id: "medical_condition" }, register('medical_condition'), { className: errors.medical_condition ? "border-red-500" : "" })), errors.medical_condition && (_jsx("p", { className: "text-sm text-red-500", children: errors.medical_condition.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "goverment_id", children: "\u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0648\u0637\u0646\u064A" }), _jsx(Input, __assign({ id: "goverment_id" }, register('goverment_id'), { className: errors.goverment_id ? "border-red-500" : "" })), errors.goverment_id && (_jsx("p", { className: "text-sm text-red-500", children: errors.goverment_id.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "referred_school", children: "\u0627\u0633\u0645 \u0627\u0644\u0645\u062F\u0631\u0633\u0629 \u0627\u0644\u0633\u0627\u0628\u0642\u0629" }), _jsx(Input, __assign({ id: "referred_school" }, register('referred_school'), { className: errors.referred_school ? "border-red-500" : "" })), errors.referred_school && (_jsx("p", { className: "text-sm text-red-500", children: errors.referred_school.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "success_percentage", children: "\u0646\u0633\u0628\u0629 \u0627\u0644\u0646\u062C\u0627\u062D" }), _jsx(Input, __assign({ id: "success_percentage", type: "number", min: "0", max: "100" }, register('success_percentage'), { className: errors.success_percentage ? "border-red-500" : "" })), errors.success_percentage && (_jsx("p", { className: "text-sm text-red-500", children: errors.success_percentage.message }))] })] }));
};
