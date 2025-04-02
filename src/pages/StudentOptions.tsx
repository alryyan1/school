// src/pages/StudentOptions.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Button,
    Grid,
    Box,
    Typography,
    styled,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Checkbox,
    FormControlLabel
} from '@mui/material';

const StyledContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    direction: 'rtl',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
}));

const StyledButton = styled(Button)(({ theme }) => ({
    margin: theme.spacing(2),
}));

const TermsAndPoliciesDialog = ({ open, onClose, onAccept }) => {
    const [accepted, setAccepted] = useState(false);

    const handleAcceptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAccepted(event.target.checked);
    };

    const handleAccept = () => {
        if (accepted) {
            onAccept();
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>شروط ولوائح القبول</DialogTitle>
            <DialogContent dividers>
                <Typography variant="body1" paragraph>
                    لوائح القبول والضوابط التربوية
                </Typography>
                <Typography variant="body1" paragraph>
                    1) التقيد بالأداب الدينية والتمسك بها داخل وخارج المدرسة.
                </Typography>
                <Typography variant="body1" paragraph>
                    2) الالتزام بالسلوك القويم مع الإدارة والمعلمين والموظفين والعمال والزملاء.
                </Typography>
                <Typography variant="body1" paragraph>
                    3) الالتزام بالزي المدرسي طيلة العام الدراسي ويجب ان لا يكون ضيقا ولاق قصيرا ويطرد من المدرسة في حالة عدم الالتزام بعد الاتصال على ولي الامر.
                </Typography>
                <Typography variant="body1" paragraph>
                    4) الظهور بمظهر شاذ وغير لائق كحلاقة راس شاذة وغير مرتبة ومهذبة واطالة الاظافر ولبس السلاسل والخاتم والذهب وغير ذلك يطرد من المدرسة في حالة عدم الالتزام بعد الاتصال على ولي الامر.
                </Typography>
                <Typography variant="body1" paragraph>
                    5) الالتزام بالخروج من الفصل اثناء الحصص الا بعد نهاية اليوم الدراسي او خلال الفسحة.
                </Typography>
                <Typography variant="body1" paragraph>
                    6) عدم حمل وتبادل اشرطة الكاست والاسطوانات والذواكر والفلاشات في المدرسة.
                </Typography>
                <Typography variant="body1" paragraph>
                    7) الالتزام بالحضور للمدرسة بالوقت المحدد وعد الخروج منها الا بعد نهاية الدوام.
                </Typography>
                <Typography variant="body1" paragraph>
                    8) الالتزام بعدم حمل المقتنيات الثمينة والالكترونية خاصة الموبايلات والتي ستصادر وتسلم الى نهاية العام الدراسي.
                </Typography>
                <Typography variant="body1" paragraph>
                    9) الالتزام باحضار جميع الأدوات المدرسية وان لا يستخدم الدفتر او الكراس الا لمادة واحدة.
                </Typography>
                <Typography variant="body1" paragraph>
                    10) الالتزام بالواجبات المدرسية لكل مادة وعرضها وتسليمها لمعلم المادة لتصحيحها وستكون هناك متابعة إدارية من مشرف الصف والإدارة.
                </Typography>
                <Typography variant="body1" paragraph>
                    11) الالزام بالجلوس في الفصل وفي المكان التي تحدده إدارة المدرسة.
                </Typography>
                <Typography variant="body1" paragraph>
                    12) اذا كان هناك طالب له ظرف خاص او حالة مرضية دائمة يجب توضيع ذلك بتقرير طبي يسلم للوحدة. الصحية بالمدرسة وفي حالة غياب الطالب بسبب حالة مرضية يجب الاتصال بإدارة المدرسة واعلامها بذلك.
                </Typography>
                <Typography variant="body1" paragraph>
                    13) كل طالب في الصف الثالث الثانوي يجب ان يحضر كل المواد الاجبارية.
                </Typography>
                <Typography variant="body1" paragraph>
                    14) الامتحانات الموحدة من الولاية او المحلية او امتحانات الشهادة يتحمل الطالب رسومها وذلك على حسب ما تحدده الولاية او المحلية وهي خارج الرسوم المدرسية.
                </Typography>
                <Typography variant="body1" paragraph>
                    15) على جميع الطلاب المحافظة على مقتنيات واثاث المدرسة فهي ملك للجميع وعدم الكتابة على الحوائط والادراج وكل من يخالف ذلك يعرض نفسه لعقوبة الفصل.
                </Typography>
                <Typography variant="body1" paragraph>
                    16) في حال عدم الالتزام بما جاء أعلاه من تعليمات يحق للمدرسة بفصل الطالب ولا يسترج رسومه.
                </Typography>
                <Typography variant="body1" paragraph>
                    17) لا ترد الرسوم باي حال من الأحوال حيث يترتب عليها حجز مقعد دراسي او مقعد ترحيل.
                </Typography>
            </DialogContent>
            <DialogActions>
                <FormControlLabel
                    control={<Checkbox checked={accepted} onChange={handleAcceptChange} />}
                    label="أوافق على الشروط واللوائح"
                />
                <Button onClick={onClose}>إلغاء</Button>
                <Button onClick={handleAccept} disabled={!accepted}>متابعة</Button>
            </DialogActions>
        </Dialog>
    );
};

const StudentOptions: React.FC = () => {
    const [openDialog, setOpenDialog] = useState(false);
    const navigate = useNavigate();

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleAcceptTerms = () => {
        handleCloseDialog();
        navigate('/students/create');
    };

    return (
        <StyledContainer>
            <Typography variant="h5" component="h2" gutterBottom>
                إدارة الطلاب
            </Typography>
            <Grid container justifyContent="center">
                <Grid item>
                    <StyledButton variant="contained" color="primary" onClick={handleOpenDialog}>
                        إضافة طالب جديد
                    </StyledButton>
                </Grid>
                <Grid item>
                    <StyledButton variant="outlined" color="primary" component={Link} to="/students/list">
                        عرض قائمة الطلاب
                    </StyledButton>
                </Grid>
            </Grid>
            <TermsAndPoliciesDialog open={openDialog} onClose={handleCloseDialog} onAccept={handleAcceptTerms} />
        </StyledContainer>
    );
};

export default StudentOptions;