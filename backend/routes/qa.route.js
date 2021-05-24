const config = require("../config");
const router = require("express").Router();
const QA = require("../models/QA");

router.get("/cek", (req, res) => {
    QA.find({}).then(qas => {
        if (qas.length > 0) {
            return res.send(qas);
        }
        res.send([]);
    });
});

router.get("/cekf", (req, res) => {
    QA.find({}).then(qas => {
        if (qas.length > 0) {
            const filteredQas = qas.filter(function(value, index, arr){ 
                return value.answer != undefined;
            });
            return res.send(filteredQas);
        }
        res.send([]);
    });
});

router.post("/my", (req, res) => {
    const { senderSchoolNo } = req.body;
    
    let errors = [];
    if (!senderSchoolNo) { errors.push("Öğrenci Numarası girilmeden soru sorgusu yapılamaz."); }    
    if (errors.length > 0) { res.status(406); return res.send({ errors }); }

    QA.find({senderSchoolNo: senderSchoolNo}).then(mineOnes => {
        if (mineOnes.length > 0) {
            return res.send(mineOnes);
        }
    });
});

router.post("/yeni", (req, res) => {
    const { question, senderName, senderSchoolNo, senderGrade } = req.body;
    let errors = [];
    if (!question) { errors.push("Yeni bir soru sorabilmek için lütfen içerik giriniz."); }    
    if (errors.length > 0) { res.status(406); return res.send({ errors }); }

    const newQA = new QA({
        type: "_soru",
        question: question,
        senderName: senderName,
        senderSchoolNo: senderSchoolNo,
        senderGrade: senderGrade,
        date: Date.now()
    });
    newQA.save();
    res.send("OK!");
});

router.post("/cevapla", (req, res) => {
    const { id, answer } = req.body;
    let errors = [];
    if (!answer || !id) { errors.push("Soru ID'si veya cevap boş olarak soru cevaplanamaz"); }    
    if (errors.length > 0) { res.status(406); return res.send({ errors }); }

    let update = {};
    update.answer = answer;
    update.date = Date.now();

    QA.findOneAndUpdate({ _id : id }, update, { upsert: true, useFindAndModify: false })
        .catch(err => console.log(err));
    return res.send("Güzel Cevap")
});

router.post("/sil", (req, res) => {
    const { id } = req.body;
    let errors = [];
    if (!id) { errors.push("Soru ID'si olmadan silinemez."); }    
    if (errors.length > 0) { res.status(406); return res.send({ errors }); }

    QA.findByIdAndDelete({_id : id}).then(()=>{
        res.send("Başarılı bir şekilde silindi.")
    }).catch(err => console.log(err))
})

module.exports = router;