let express = require('express');
let hbs = require('express-handlebars');
let db = require('mongoose');
let fs = require('fs');
let Handlebars = require('handlebars');
let NumeralHelper = require("handlebars.numeral");
NumeralHelper.registerHelpers(Handlebars);
let userSchema = require('./model/userSchema');
let productSchema = require('./model/productSchema');
let AdministratorSchema = require('./model/AdministratorSchema');
let cartSchema = require('./model/cartSchema');
let checkCoachSchema = require('./model/checkCoach');
let notificationSchema = require('./model/NotificationSchema');
let reportSchema = require('./model/reportSchema');
let soldoutproductSchema = require('./model/SoldOutProductSchema');

let message = require('firebase-admin')
let serviceAccount = require("./PT Connect-daca5f65cc4a.json");
message.initializeApp({
    credential: message.credential.cert(serviceAccount),
    databaseURL: "https://demofirebase-ff65c.firebaseio.com"
});
let User = db.model('User', userSchema, 'users');
let Product = db.model('Product', productSchema, 'products');
let Administrator = db.model('Administrator', AdministratorSchema, 'administrator');
let Cart = db.model("Cart", cartSchema, 'cart');
let CheckCoach = db.model("checkCoach", checkCoachSchema, 'checkCoach');
let Notification = db.model("notification", notificationSchema, 'notification');
let Report = db.model("report", reportSchema, 'report');
let SoldoutProduct = db.model("soldOutProducts", soldoutproductSchema, 'soldOutProducts');


let body = require('body-parser');
let multer = require('multer')
db.connect('mongodb+srv://lamntph07140:GsGdVaP7Sg3XSbcq@cluster0-kylu8.gcp.mongodb.net/databaseAss', {}).then(function (res) {
    console.log('conected');
})
let title = "PT Connect"
let bodyNotification = "Hồ sơ của bạn đã được duyệt "
let bodyNotificationCacel = "Hồ sơ của bạn không được chấp thuận "
let app = express();
let payload = {
    notification: {
        title: title,
        body: "Hồ sơ của bạn đã được duyệt ",
    },
    data: {
        title: "Thong bao111",
        body: "Nghi ",
    }

};

let payloadCancel = {
    notification: {
        title: "PT Connect",
        body: "Hồ sơ của bạn không được chấp thuận ",
    },

}


let option = {
    priority: "high",
    timeToLive: 60 * 60 * 24
}

let multerConfig = multer.diskStorage({
    destination: function (req, file, cb) {

        //thiết lập file lưu
        cb(null, './public');
    }, filename(req, file, cb) {

        //chỉ cho phép tải lên các loại ảnh jpeg & jpg

        //thông báo lỗi khi upload file không hợp lệ
        //thiết lập tên file
        cb(null, file.originalname)


    }
})


let upload = multer({
    storage: multerConfig, limits: {
        fileSize: 2 * 1024 * 1024
    }
})

let file = upload.single('exImage')
let fileSoldProduct = upload.single('nImageSoldSPUpdate')
app.post('/upload', function (req, res) {
    file(req, res, function (err) {


        if (err) {
            if (req.files.length >= 5) {
                res.render("upsanpham", {data: "Số lượng file không được lớn hơn 5"});
            } else if (err instanceof multer.MulterError) {
                res.render("upsanpham", {data: "Giới hạn 2MB"});
            } else {

                res.render("upsanpham", {data: err});

            }


        } else {
            res.render("upsanpham", {data: 'Upload ảnh thành công. Kiểm tra thư mục uploads'});

        }
    })
});

let path = require('path');
app.use('/public', express.static(path.join(__dirname, 'public')))
app.use(body.json());
app.use(body.urlencoded({extended: true}));
app.engine('.hbs', hbs({
    extname: 'hbs',
    defaultLayout: '',
    layoutsDir: ''
}));


app.set('view engine', '.hbs');
app.listen(process.env.PORT || 3002);

app.get('/', function (request, response) {
    response.render("test", {status: 'none', status2: "none", animate: "animate"});
});

app.get('/gioithieu', function (request, response) {
    response.render("gioithieu");
});

app.get('/dichvu', function (request, response) {
    response.render("dichvu");
});

app.get('/hotro', function (request, response) {
    response.render("hotro");
});

app.get('/lienhe', function (request, response) {
    response.render("lienhe");
});


app.get('/createAdmin', async function (request, response) {
    let nnUserAd = await Administrator.find({}).lean();
    response.render('listAdministrator', {
        data: nnUserAd,
        status: 'none',
    });
})
app.post('/createAdmin', async function (request, response) {
    let nUserAd = request.body.nUserAd;
    let nPassAd = request.body.nPassAd;
    if (nUserAd && nPassAd) {
        let administrator = await Administrator.find({userAdmin: nUserAd}).lean();   //dk
        if (administrator.length <= 0) {
            let newUserAd = new Administrator({
                userAdmin: nUserAd,
                passwordAdmin: nPassAd,
            });
            let status = await newUserAd.save();
            if (status) {
                let nnUserAd = await Administrator.find({}).lean();
                response.render('listAdministrator', {
                    data: nnUserAd,
                    status: 'block',
                    textAlert: 'Tạo tài khoản thành công.',
                });
            } else {
                let nnUserAd = await Administrator.find({}).lean();
                response.render('listAdministrator', {
                    data: nnUserAd,
                    status: 'block',
                    textAlert: 'Tạo tài khoản thất bại.',
                });
            }
        } else {
            let nnUserAd = await Administrator.find({}).lean();
            response.render('listAdministrator', {
                data: nnUserAd,
                status: 'block',
                textAlert: 'Tài khoản đã tồn tại.Mời tạo tài khoản khác !',
            });
        }
    } else {
        response.render('listAdministrator', {
            status: 'none',
        });
    }
});//done


app.get('/signUpAdmin', async function (req, res) {
    res.render('addAdmin', {
        btnUD: 'Xong',
        dsp: 'block'
    });
});

app.post('/signUpAdmin', async function (request, response) {
    let update = request.body.update;
    console.log(update + '')
    if (update == 1) {
        update = 0;

        let idAd = request.body.idAd;
        let userAd = request.body.userAd;
        let passAd = request.body.passAd;
        response.render('signUp', {
            btnUpdateAd: 'Cập nhật',
            userAd: userAd,
            passAd: passAd,
            idAd: idAd,
            dsp: 'block'
        });
    } else {
        response.render('addAdmin', {
            btnUD: 'Xong',
            dsp: 'block'
        });
    }

});//done

app.get('/listAdmin', async function (request, response) {
    let administrator = await Administrator.find({}).lean();
    response.render('listAdministrator', {data: administrator, status: 'none'});
});//done
app.get('/updateAdmin', async function (request, response) {

    let nIdAd = request.query.nIdAd;
    let nUserAd = request.query.nUserAd;
    let nPassAd = request.query.nPassAd;

    let administrator = await Administrator.find({userAdmin: nUserAd, passwordAdmin: nPassAd}).lean();   //dk
    if (administrator.length <= 0) {
        console.log(nIdAd + " edit kh");
        let status = await Administrator.findByIdAndUpdate(nIdAd, {
            userAdmin: nUserAd,
            passwordAdmin: nPassAd
        });
        let nAdmin = await Administrator.find({}).lean();
        if (status) {
            response.render('listAdministrator', {
                data: nAdmin,
                status: 'block',
                textAlert: 'Cập nhật Administrator thành công.'
            });
        } else {
            response.render('listAdministrator', {
                data: nAdmin,
                status: 'block',
                textAlert: 'Cập nhật Administrator thất bại.'
            });
        }
    } else {
        let nAdmin = await Administrator.find({}).lean();
        response.render('listAdministrator', {
            data: nAdmin,
            status: 'block',
            textAlert: 'Cập nhật khách hàng thất bại. Tên khách hàng đã tồn tại.'
        });
    }
});//done

app.get('/delAdmin', async function (request, response) {
    let nAdmin = await Administrator.find({}).lean();
    response.render('listAdministrator', {
        data: nAdmin,
        status: 'none',
    });
})

app.post('/delAdmin', async function (request, response) {
    let idAd = request.body.idAd;
    console.log(idAd + "del kh");

    let status = await Administrator.findByIdAndDelete(idAd);
    let nAdmin = await Administrator.find({}).lean();
    if (status) {
        response.render('listAdministrator', {
            data: nAdmin,
            status: 'block',
            textAlert: 'Xóa Admin thành công.'
        });
    } else {
        response.render('listAdministrator', {
            data: nAdmin,
            status: 'block',
            textAlert: 'Xóa Admin thất bại.'
        });
    }
});//dome


app.get('/sanpham', async function (request, response) {
    let sm = request.query.sm;

    if (sm == "supply") {
        let products = await Product.find({Classify: "supply"}).lean();
        response.render('sanpham', {data: products, title: "Thực phẩm hỗ trợ"});
    } else if (sm == "equipment") {
        let products = await Product.find({Classify: "equipment"}).lean();
        response.render('sanpham', {data: products, title: "Dụng cụ tập luyện"});
    } else if (sm == "clothes") {
        let products = await Product.find({Classify: "clothes"}).lean();
        response.render('sanpham', {data: products, title: "Quần áo tập luyện"});
    } else {
        let products = await Product.find({}).lean();
        response.render('sanpham', {data: products, title: "Tất cả sản phẩm"});
    }


});//done

app.post('/sanpham', async function (request, response) {
    let userAdmin = request.body.userAdmin;
    let passwordAdmin = request.body.passwordAdmin;
    let sm = request.body.sm;
    let administrator = await Administrator.find({userAdmin: userAdmin, passwordAdmin: passwordAdmin}).lean();   //dk

    if (administrator.length <= 0 && sm == 1) {

        response.render('test', {
            status: 'block',
            status2: 'block',
            data: 'Không thể đăng nhập, kiểm tra lại tài khoản và mật khẩu của bạn.',
            user: '',
            pass: ''
        });

    } else {
        let products = await Product.find({}).lean();
        response.render('sanpham', {data: products, userAdmin: userAdmin, status: 'block', title: "Tất cả sản phẩm"});
    }
});


app.get('/qlysanpham', async function (request, response) {
    let products = await Product.find({}).lean();
    response.render('qlysanpham', {data: products, statusDisplay: "none", title: "Sản phẩm còn hàng"});
});


app.get('/upsanpham', async function (request, response) {
    response.render('upsanpham', {status: 'none'});

});

app.post('/uploadProduct', (request, response) => {

    file(request, response, async function (err) {
        if (err) {
            // kiem tra loi co phai la max file ko
            if (err instanceof multer.MulterError) {
                response.send('kích thước file lớn hơn 2mb' + response)
            } else {
                response.send('' + err)
            }

        } else {
            let nameSP = request.body.nameSP;
            let priceSP = request.body.priceSP;
            let descriptionSP = request.body.descriptionSP;
            let slSP = request.body.slSP;
            let classify = request.body.classifySP;
            let rateSP = request.body.rateSP;
            let image = request.file.filename;
            let products = await Product.find({
                ProductName: nameSP,
                Price: priceSP,
                Description: descriptionSP,
                Quantity: slSP,
                Classify: classify,
                ImageProduct: image,
                Rating: rateSP
            }).lean();
            if (products.length <= 0) {
                let addProduct = new Product({
                    ProductName: nameSP,
                    Price: priceSP,
                    Description: descriptionSP,
                    Quantity: slSP,
                    Classify: classify,
                    ImageProduct: image,
                    Rating: rateSP
                });
                let status = addProduct.save();
                if (status) {
                    response.render('upsanpham', {status: 'block', data: 'Thêm sản phẩm ' + nameSP + ' thành công.'});

                } else {
                    response.render('upsanpham', {status: 'block', data: 'Thêm sản phẩm ' + nameSP + ' thất bại.'});

                }
            } else {
                response.render('upsanpham', {
                    status: 'block',
                    data: 'Thêm sản phẩm ' + nameSP + ' thất bại. Sản phẩm đã tồn tại.'
                });
            }

        }
    })


});


app.post('/updatesanpham', async function (request, response) {

    let update = request.body.update;
    console.log(update + '')
    if (update == 1) {
        update = 0;

        let idSP = request.body.idSP;
        let imageSP = request.body.exImage;
        let nameSP = request.body.nameSP;
        let priceSP = request.body.priceSP;
        let descriptionSP = request.body.descriptionSP;
        let classifySP = request.body.classifySP;
        let slSP = request.body.slSP;
        let rateSP = request.body.rateSP;


        response.render('updatesanpham', {
            title: 'Cập nhật sản phẩm',
            status: 'none',
            btnUD: 'Cập nhật',
            btnC: 'Làm lại',
            idSP: idSP,
            imageSP: imageSP,
            nameSP: nameSP,
            priceSP: priceSP,
            descriptionSP: descriptionSP,
            classifySP: classifySP,
            slSP: slSP,
            rateSP: rateSP
        });
    }


});
app.get('/updateSPdone', async function (request, response) {
    let nProduct = await Product.find({}).lean();
    response.render('qlysanpham', {
        data: nProduct,
        statusDisplay: 'none'
    });
})
app.post('/updateSPdone', async function (request, response) {
    file(request, response, async function (err) {
        if (err) {
            // kiem tra loi co phai la max file ko
            if (err instanceof multer.MulterError) {
                response.send('kích thước file lớn hơn 2mb' + response)
            } else {
                response.send('' + err)
            }

        }
        let nId = request.body.nId;
        let nameSP = request.body.nameSP;
        let priceSP = request.body.priceSP;
        let exImage = request.file.filename;
        let descriptionSP = request.body.descriptionSP;
        let classifySP = request.body.classifySP;
        let slSP = request.body.slSP;
        let rateSP = request.body.rateSP;

        let products = await Product.find({
            ProductName: nameSP,
            Price: priceSP,
            Description: descriptionSP,
            Quantity: slSP,
            Classify: classifySP,
            ImageProduct: exImage,
            Rating: rateSP
        }).lean();   //dk
        if (products.length <= 0) {
            console.log(nId + "edit sp");
            let status = await Product.findByIdAndUpdate(nId, {
                ProductName: nameSP,
                Price: priceSP,
                Description: descriptionSP,
                Quantity: slSP,
                Classify: classifySP,
                ImageProduct: exImage,
                Rating: rateSP
            });
            let nProduct = await Product.find({}).lean();
            if (status) {
                response.render('qlysanpham', {
                    data: nProduct,
                    statusDisplay: 'block',
                    textAlert: 'Cập nhật sản phẩm thành công.'
                });
            } else {
                response.render('qlysanpham', {
                    data: nProduct,
                    statusDisplay: 'block',
                    textAlert: 'Cập nhật sản phẩm thất bại.'
                });
            }
        } else {
            let nProduct = await Product.find({}).lean();
            response.render('qlysanpham', {
                data: nProduct,
                statusDisplay: 'block',
                textAlert: 'Cập nhật sản phẩm thất bại. Sản phẩm cập nhật đã tồn tại.'
            });
        }
    });
});

app.get('/delsanpham', async function (request, response) {
    let nProduct = await Product.find({}).lean();
    response.render('qlysanpham', {
        data: nProduct,
        statusDisplay: 'none',
    });
})
app.post('/delsanpham', async function (request, response) {

    let idSP = request.body.idSP;

    let status = await Product.findByIdAndDelete(idSP);
    let nProduct = await Product.find({}).lean();
    if (status) {
        response.render('qlysanpham', {
            data: nProduct,
            statusDisplay: 'block',
            textAlert: 'Xóa sản phẩm thành công.'
        });
    } else {
        response.render('qlysanpham', {
            data: nProduct,
            statusDisplay: 'block',
            textAlert: 'Xóa sản phẩm thất bại.'
        });
    }
});

app.post('/delSoldsanpham',(req, res)=> {
    let idSP = req.body.idSoldSPDel;
    SoldoutProduct.deleteOne({_id:idSP}, async function (err) {
        if(err == null) {
            let soldOutProducts = await SoldoutProduct.find({}).lean();
            res.render('qlySoldOutSanpham', {data: soldOutProducts, statusDisplay: "block", textAlert: 'Xóa sản phẩm thành công'});
        } else {
            let soldOutProducts = await SoldoutProduct.find({}).lean();
            res.render('qlySoldOutSanpham', {data: soldOutProducts, statusDisplay: "block", textAlert: 'Lỗi server'});
            console.log(err.message);
        }
    });
});

app.post('/updateSoldsanpham',async (req, res)=> {
    let idSP = req.body.idSoldSPUpdate;
    let detailSoldOutProduct = await SoldoutProduct.findById(idSP);
    res.render('updateSoldsanpham', {
        idSP: detailSoldOutProduct._id,
        nameSP: detailSoldOutProduct.ProductName,
        priceSP: detailSoldOutProduct.Price,
        imageSP: detailSoldOutProduct.ImageProduct,
        classifySP: detailSoldOutProduct.Classify,
        descriptionSP: detailSoldOutProduct.Description,
        slSP: detailSoldOutProduct.Quantity,
        rateSP: detailSoldOutProduct.Rating,
        statusDisplay: "none"
    });
});

app.post('/updateSoldSPdone',async function (req, res) {
    let idSP = req.body.idSoldSPUpdate;
    let detailSoldOutProduct = await SoldoutProduct.find({_id:idSP});
    console.log(detailSoldOutProduct);
    fileSoldProduct(req, res, async function (err) {
        if (err) {
            if (err instanceof multer.MulterError) {
                res.render("updateSoldsanpham", {
                    textAlert: "Giới hạn 2MB",
                    nameSP: detailSoldOutProduct.ProductName,
                    priceSP: detailSoldOutProduct.Price,
                    imageSP: detailSoldOutProduct.ImageProduct,
                    classifySP: detailSoldOutProduct.Classify,
                    descriptionSP: detailSoldOutProduct.Description,
                    slSP: detailSoldOutProduct.Quantity,
                    rateSP: detailSoldOutProduct.Rating,
                    statusDisplay: "block"});
            } else {
                res.render("updateSoldsanpham", {textAlert: err.message,idSP: detailSoldOutProduct._id,
                    nameSP: detailSoldOutProduct.ProductName,
                    priceSP: detailSoldOutProduct.Price,
                    imageSP: detailSoldOutProduct.ImageProduct,
                    classifySP: detailSoldOutProduct.Classify,
                    descriptionSP: detailSoldOutProduct.Description,
                    slSP: detailSoldOutProduct.Quantity,
                    rateSP: detailSoldOutProduct.Rating,
                    statusDisplay: "block"});
            }
        }
        let idSP = req.body.nIdSoldSPUpdate;
        let nNameSoldSPUpdate = req.body.nNameSoldSPUpdate;
        let nPriceSoldSPUpdate = req.body.nPriceSoldSPUpdate;
        let nImageSoldSPUpdate = req.file.filename;
        console.log(req.file.filename);
        let nClassifySoldSPUpdate = req.body.nClassifySoldSPUpdate;
        let nDescriptionSoldSPUpdate = req.body.nDescriptionSoldSPUpdate;
        let nSlSoldSPUpdate = req.body.nSlSoldSPUpdate;
        let nRateSoldSPUpdate = req.body.nRateSoldSPUpdate;
        SoldoutProduct.updateOne({_id: idSP}, {
                ProductName: nNameSoldSPUpdate,
                Price: nPriceSoldSPUpdate,
                Description: nDescriptionSoldSPUpdate,
                Quantity: nSlSoldSPUpdate,
                Classify: nClassifySoldSPUpdate,
                ImageProduct: nImageSoldSPUpdate,
                Rating: nRateSoldSPUpdate,
            }, async function (err) {
                if (err == null) {
                    let soldOutProducts = await SoldoutProduct.find({}).lean();
                    res.render('qlySoldOutSanpham', {
                        data: soldOutProducts,
                        statusDisplay: "block",
                        textAlert: "Cập nhật thành công"
                    });
                } else {
                    let soldOutProducts = await SoldoutProduct.find({}).lean();
                    res.render('qlySoldOutSanpham', {
                        data: soldOutProducts,
                        statusDisplay: "block",
                        textAlert: "Lỗi Server"
                    });
                    console.log(err.message);
                }
            }
        );
    });
});

app.get('/updateSoldSPdone', async function (req, res) {
    let soldOutProducts = await SoldoutProduct.find({}).lean();
    res.render('qlySoldOutSanpham', {data: soldOutProducts, statusDisplay: "none"});
});


app.get('/delSoldsanpham', async function (req, res) {
    let soldOutProducts = await SoldoutProduct.find({}).lean();
    res.render('qlySoldOutSanpham', {data: soldOutProducts, statusDisplay: "none"});
});

app.get('/updateSoldsanpham', async function (req, res) {
    let soldOutProducts = await SoldoutProduct.find({}).lean();
    res.render('qlySoldOutSanpham', {data: soldOutProducts, statusDisplay: "none"});
});

app.post('/sold_outsanpham', (req, res) => {
    let idSP = req.body.idSoldSP;
    let nameSoldSP = req.body.nameSoldSP;
    let priceSoldSP = req.body.priceSoldSP;
    let descriptionSoldSP = req.body.descriptionSoldSP;
    let quantitySoldSP = req.body.quantitySoldSP;
    let classifySoldSP = req.body.classifySoldSP;
    let imageSoldSP = req.body.imageSoldSP;
    let ratingSoldSP = req.body.ratingSoldSP;
    SoldoutProduct({
        ProductName: nameSoldSP,
        Price: priceSoldSP,
        Description: descriptionSoldSP,
        Quantity: quantitySoldSP,
        Classify: classifySoldSP,
        ImageProduct: imageSoldSP,
        Rating: ratingSoldSP,
    }).save(async function (err){
        if (err == null) {
            Product.deleteOne({_id: idSP}, async function (err) {
                if(err == null) {
                    let soldOutProducts = await SoldoutProduct.find({}).lean();
                    res.render('qlySoldOutSanpham', {data: soldOutProducts, statusDisplay: "block", textAlert: "Sản phẩm "+nameSoldSP+" đã hết"});
                } else {
                    let products = await Product.find({}).lean();
                    res.render('qlysanpham', {data: products, statusDisplay: "block", textAlert: "Lỗi Server"});
                    console.log(err.message);
                }
            });
        } else {
            let products = await Product.find({}).lean();
            res.render('qlysanpham', {data: products, statusDisplay: "block", textAlert: "Lỗi Server"});
            console.log(err.message);
        }
    });
});

app.post('/backToSellsanpham', (req, res) => {
    let idSP = req.body.idBTSSP;
    let nameBTSSP = req.body.nameBTSSP;
    let priceBTSSP = req.body.priceBTSSP;
    let descriptionBTSSP = req.body.descriptionBTSSP;
    let quantityBTSSP = req.body.quantityBTSSP;
    let classifyBTSSP = req.body.classifyBTSSP;
    let imageBTSSP = req.body.imageBTSSP;
    let ratingBTSSP = req.body.ratingBTSSP;
    Product({
        ProductName: nameBTSSP,
        Price: priceBTSSP,
        Description: descriptionBTSSP,
        Quantity: quantityBTSSP,
        Classify: classifyBTSSP,
        ImageProduct: imageBTSSP,
        Rating: ratingBTSSP,
    }).save(async function (err){
        if (err == null) {
            SoldoutProduct.deleteOne({_id: idSP}, async function (err) {
                if(err == null) {
                    let products = await Product.find({}).lean();
                    res.render('qlysanpham', {data: products, statusDisplay: "block", textAlert: "Sản phẩm "+nameBTSSP+" được bán trở lại"});
                } else {
                    let soldOutProducts = await SoldoutProduct.find({}).lean();
                    res.render('qlySoldOutSanpham', {data: soldOutProducts, statusDisplay: "block", textAlert: "Lỗi Server"});
                    console.log(err.message);
                }
            });
        } else {
            let soldOutProducts = await SoldoutProduct.find({}).lean();
            res.render('qlySoldOutSanpham', {data: soldOutProducts, statusDisplay: "block", textAlert: "Lỗi Server"});
            console.log(err.message);
        }
    });
});


app.get('/updatesanpham',async (req, res) => {
    let products = await Product.find({}).lean();
    res.render('qlysanpham', {data: products, statusDisplay: "none"});;
});

app.get('/sold_outsanpham',async (req, res) => {
    let soldOutProducts = await SoldoutProduct.find({}).lean();
    res.render('qlySoldOutSanpham', {data: soldOutProducts, statusDisplay: "none"});
});

app.get('/backToSellsanpham',async (req, res) => {
    let products = await Product.find({}).lean();
    res.render('qlysanpham', {data: products, statusDisplay: "none"});
});

app.get('/qlykhachhang', async function (request, response) {
    let users = await User.find({}).lean();
    response.render('quanlykhachhang', {data: users, status: 'none'});

});
app.get('/createkhachhang', async function (request, response) {
    let nnUser = await User.find({}).lean();
    response.render('quanlykhachhang', {
        data: nnUser,
        status: 'none',
    });
})

app.post('/createkhachhang', async function (request, response) {
    let nUser = request.body.nUser;
    let nPass = request.body.nPass;
    let nFullname = request.body.nFullname;
    let nPhone = request.body.nPhone;
    let nEmail = request.body.nEmail;
    let nAddress = request.body.nAddress;
    if (nUser && nPass) {
        let users = await User.find({Username: nUser}).lean();   //dk
        if (users.length <= 0) {
            let newUser = new User({
                Username: nUser,
                Password: nPass,
                Fullname: nFullname,
                Phone: nPhone,
                Email: nEmail,
                Address: nAddress,
            });
            let status = await newUser.save();
            if (status) {
                let nnUser = await User.find({}).lean();
                response.render('quanlykhachhang', {
                    data: nnUser,
                    status: 'block',
                    textAlert: 'Tạo tài khoản thành công.',
                });
            } else {
                let nnUser = await User.find({}).lean();
                response.render('quanlykhachhang', {
                    data: nnUser,
                    status: 'block',
                    textAlert: 'Tạo tài khoản thất bại.',
                });
            }
        } else {
            let nnUser = await User.find({}).lean();
            response.render('quanlykhachhang', {
                data: nnUser,
                status: 'block',
                textAlert: 'Tài khoản đã tồn tại.Mời tạo tài khoản khác !',
            });
        }
    } else {
        response.render('quanlykhachhang', {
            status: 'none',
        });
    }

});
app.get('/signUpkhachhang', async function (request, response) {
    response.render('addKhachHang', {
        btnUD: 'Xong',
        dsp: 'block'
    });


})
app.post('/signUpkhachhang', async function (request, response) {
    let update = request.body.update;
    console.log(update + '')
    if (update == 2) {
        update = 0;

        let idKH = request.body.idKH;
        let userKH = request.body.userKH;
        let passKH = request.body.passKH;
        let FullnameKH = request.body.FullnameKH;
        let PhoneKH = request.body.PhoneKH;
        let AddressKH = request.body.AddressKH;
        let EmailKH = request.body.EmailKH;

        response.render('signUpKhach', {
            btnUDKH: 'Cập nhật khách hàng',
            userKH: userKH,
            passKH: passKH,
            FullnameKH: FullnameKH,
            PhoneKH: PhoneKH,
            AddressKH: AddressKH,
            EmailKH: EmailKH,
            idKH: idKH,
            dsp: 'block'
        });
    } else {
        response.render('addKhachHang', {
            btnUD: 'Xong',
            dsp: 'block'
        });
    }

});
app.get('/updateKH', async function (request, response) {
    let nUsers = await User.find({}).lean();
    response.render('quanlykhachhang', {
        data: nUsers,
        status: 'none',
    });
})
app.post('/updateKH', async function (request, response) {

    let idKH = request.body.nIdKH;
    let userKH = request.body.nUserKH;
    let passKH = request.body.nPassKH;
    let FullnameKH = request.body.nFullname;
    let PhoneKH = request.body.nPhone;
    let AddressKH = request.body.nAddress;
    let EmailKH = request.body.nEmail;

    let users = await User.find({
        Username: userKH, Password: passKH, Fullname: FullnameKH
        , Phone: PhoneKH, Email: EmailKH, Address: AddressKH
    }).lean();   //dk
    if (users.length <= 0) {
        console.log(idKH + " edit kh");
        let status = await User.findByIdAndUpdate(idKH, {
            Username: userKH,
            Password: passKH,
            Fullname: FullnameKH,
            Phone: PhoneKH,
            Email: EmailKH,
            Address: AddressKH,
        });
        let nUsers = await User.find({}).lean();
        if (status) {
            response.render('quanlykhachhang', {
                data: nUsers,
                status: 'block',
                textAlert: 'Cập nhật khách hàng thành công.'
            });
        } else {
            let nUsers = await User.find({}).lean();
            response.render('quanlykhachhang', {
                data: nUsers,
                status: 'block',
                textAlert: 'Cập nhật khách hàng thất bại.'
            });
        }
    } else {
        let nUsers = await User.find({}).lean();
        response.render('quanlykhachhang', {
            data: nUsers,
            status: 'block',
            textAlert: 'Cập nhật khách hàng thất bại. Tên khách hàng đã tồn tại.'
        });
    }
});
app.get('/delKH', async function (request, response) {
    let nUsers = await User.find({}).lean();
    response.render('quanlykhachhang', {
        data: nUsers,
        status: 'none',
    });
})
app.post('/delKH', async function (request, response) {
    let idKH = request.body.idKH;


    let status = await User.findByIdAndDelete(idKH);
    let nUsers = await User.find({}).lean();
    if (status) {
        response.render('quanlykhachhang', {
            data: nUsers,
            status: 'block',
            textAlert: 'Xóa khách hàng thành công.'
        });
    } else {
        response.render('quanlykhachhang', {
            data: nUsers,
            status: 'block',
            textAlert: 'Xóa khách hàng thất bại.'
        });
    }
});

app.get('/listcoach', async function (request, response) {

    let coach = await User.find({Type: "Coach"}).lean();
    response.render('listCoach', {data: coach});
});//done
app.get('/detailProduct', async function (request, response) {
    let btn = request.query.btn;
    console.log(btn + "")
    if (btn == "1") {
        let idSP = request.query.idSP;
        let product = await Product.find({_id: idSP}).lean();
        response.render('detailProduct', {data: product, style1: "block", style2: "none"});
    }
});
app.get('/detailCoach', async function (request, response) {
    let btn = request.query.btn;
    console.log(btn + "")
    if (btn == "1") {
        let idCoach = request.query.idCoach;
        let coach = await User.find({_id: idCoach}).lean();
        response.render('detailCoach', {data: coach, style1: "block", style2: "none"});
    }
});

app.get('/thongke', async function (request, response) {
    let ts = Date.now();
    let date = new Date().getDate();
    let dateAfter = new Date().getDate() + 1;
    let month = new Date(ts).getMonth() + 1;
    let year = new Date().getFullYear();
    let date_ob = new Date(ts);
    let CartInADay;
    console.log(year + "-" + month + "-0" + dateAfter);
    console.log(date_ob);
    let allProduct = await Product.find({}).lean();
    let allUser = await User.find({}).lean();
    let allCart = await Cart.find({}).lean();
    let allCoach = await User.find({Type: "Coach"}).lean();
    let BoyUser = await User.find({Sex: "Nam"}).lean();
    let GirlUser = await User.find({Sex: "Nữ"}).lean();
    let CustomersWaitingApproval = await User.find({Status: "Wating"}).lean();
    let CustomersNotCoach = await User.find({Status: "None"}).lean();
    let FeedbackFromCustomers = await Report.find({}).lean();
    let FeedbackNotResponded = await Report.find({Status: "No Feedback"}).lean();
    let FeedbackResponded = await Report.find({Status: "Feedbacked"}).lean();
    if (date < 9) {
        CartInADay = await Cart.find({
            $and: [
                {DateCart: {$lte: year + "-" + month + "-0" + dateAfter + "T04:00:00.00"}},
                {DateCart: {$gte: year + "-" + month + "-0" + date + "T04:00:00.00"}},
            ]
        }).lean();
    } else if (date == 9) {
        CartInADay = await Cart.find({
            $and: [
                {DateCart: {$lte: year + "-" + month + "-" + dateAfter + "T04:00:00.00"}},
                {DateCart: {$gte: year + "-" + month + "-0" + date + "T04:00:00.00"}},
            ]
        }).lean();
    } else {
        CartInADay = await Cart.find({
            $and: [
                {DateCart: {$lte: year + "-" + month + "-" + dateAfter + "T04:00:00.00"}},
                {DateCart: {$gte: year + "-" + month + "-" + date + "T04:00:00.00"}},
            ]
        }).lean();
    }

    let CartInMonth = await Cart.find({
        $and: [
            {DateCart: {$lte: year + "-" + month + "-31T02:00:00.00"}},
            {DateCart: {$gte: year + "-" + month + "-01T02:00:00.00"}},
        ]
    }).lean();

    let TotalInDay = 0;
    for (let i = 0; i < CartInADay.length; i++) {
        TotalInDay += CartInADay[i].TotalPrice
    }
    let TotalInMonth = 0;
    for (let i = 0; i < CartInMonth.length; i++) {
        TotalInMonth += CartInMonth[i].TotalPrice
    }

    response.render("thongke",
        {
            dateNow: date + "-" + month + "-" + year,
            MonthNow: month,
            allProduct: allProduct.length + "",
            allUser: allUser.length + "",
            allCart: allCart.length + "",
            allCoach: allCoach.length + "",
            BoyUser: BoyUser.length + "",
            GirlUser: GirlUser.length + "",
            CustomersWaitingApproval: CustomersWaitingApproval.length + "",
            CustomersNotCoach: CustomersNotCoach.length + "",
            FeedbackFromCustomers: FeedbackFromCustomers.length + "",
            FeedbackNotResponded: FeedbackNotResponded.length + "",
            FeedbackResponded: FeedbackResponded.length + "",
            CartInADay: CartInADay.length + "",
            CartInMonth: CartInMonth.length + "",
            TotalInDay: TotalInDay + "",
            TotalInMonth: TotalInMonth + ""
        });
});

app.get('/quantriHLV', async function (request, response) {
    let newCoach = await CheckCoach.find({}).lean();
    response.render('coachManagement', {
        data: newCoach,
        status: "none",
    })
});

app.get('/baocao', async function (request, response) {
    let report = await Report.find({Status: "No Feedback"}).lean();
    response.render("report", {data: report, status: "none"});
});

app.post('/detailReport', async function (request, response) {
    let id = request.body.idReport;
    let report = await Report.find({_id: id}).lean();
    response.render("detailReport", {data: report});
});
app.get('/sendReport', async function (reqquest, response) {
    let report = await Report.find({Status: "No Feedback"});
    response.render("report", {data: report, status: "none"});
});
app.post('/sendReport', async function (request, response) {

    let btn = request.body.sm;
    let FeedBack = request.body.FeedBack;
    let idReport = request.body.idReport;
    let usernameReport = request.body.usernameReport;
    let token = request.body.tokenReport;
    console.log("token " + token);
    console.log("id " + idReport);
    console.log("id " + usernameReport);
    console.log("id " + FeedBack);
    console.log("id " + btn);
    if (btn == "Send") {
        let ts = Date.now();
        let date_ob = new Date(ts);
        let payloadReport = {
            notification: {
                title: "PT Connect phản hồi",
                body: FeedBack,
            },
        }
        message.messaging().sendToDevice(token, payloadReport, option)
            .then(function (response) {

            })
            .catch(function (error) {

            });
        let newNotiReport = new Notification({
            Username: usernameReport,
            Title: "PT Connect phản hồi",
            Description: FeedBack,
            DateRecieve: date_ob
        });
        await newNotiReport.save();
        await Report.findByIdAndUpdate(idReport, {Status: "Feedbacked"});
        let report = await Report.find({Status: "No Feedback"});
        response.render("report", {data: report, textAlert: "Gửi phản hồi thành công", status: "block"});

    } else if (btn == "delete") {
        let report = await Report.find({Status: "No Feedback"}).lean();
        response.render("report", {data: report});

    }


});

app.get("/confirmCoach", async function (request, response) {
    let newCoach = await CheckCoach.find({}).lean();
    response.render("coachManagement", {data: newCoach, status: "none"})
})
app.post('/confirmCoach', async function (request, response) {
    let btn = request.body.btn;
    let _id = request.body.idCoach;
    let usernameCoach = request.body.usernameCoach;
    console.log("id" + _id)
    console.log(usernameCoach)
    let imgCoach = request.body.imgCoach;
    let ageCoach = request.body.ageCoach;
    let specializedCoach = request.body.specializedCoach;
    let workplaceCoach = request.body.workplaceCoach;
    let backgroundCoach = request.body.backgroundCoach;
    let rating = request.body.rating;
    let token = request.body.tokenCoach;
    let addressCoach = request.body.addressCoach;
    console.log(addressCoach + "")
    if (btn == "confirm") {
        let stt = await User.findByIdAndUpdate(_id, {
            ImageProfile: imgCoach,
            Workplace: workplaceCoach,
            Background: backgroundCoach,
            Age: ageCoach,
            Specialized: specializedCoach,
            Type: "Coach",
            Rating: rating,
            Status: "Updated",
            Address: addressCoach,
        });
        let ts = Date.now();

        let date_ob = new Date(ts);
        message.messaging().sendToDevice(token, payload, option)
            .then(function (response) {

            })
            .catch(function (error) {

            });
        console.log(stt + "")
        let newNoti = new Notification({
            Username: usernameCoach,
            Title: title,
            Description: bodyNotification,
            DateRecieve: date_ob
        });
        await newNoti.save();
        if (stt) {

            let stt2 = await CheckCoach.findByIdAndDelete(_id)
            if (stt2) {
                let newCoach = await CheckCoach.find({}).lean();
                response.render("coachManagement", {
                    data: newCoach,
                    status: "display",
                    textAlert: "Xác nhận HLV thành công "
                });
            }
        } else {
            let newCoach = await CheckCoach.find({}).lean();
            response.render("coachManagement", {data: newCoach, status: "display", textAlert: "Xác nhận HLV bị lỗi "})
        }
    } else if (btn == "delete") {
        let ts = Date.now();

        let date_ob = new Date(ts);
        message.messaging().sendToDevice(token, payloadCancel, option)
            .then(function (response) {

            })
            .catch(function (error) {

            });

        let newNoti = new Notification({
            Username: usernameCoach,
            Title: title,
            Description: bodyNotificationCacel,
            DateRecieve: date_ob
        });
        await newNoti.save();
        let stt2 = await CheckCoach.findByIdAndDelete(_id)
        await User.findByIdAndUpdate(_id, {Status: "None"})
        if (stt2) {
            let newCoach = await CheckCoach.find({}).lean();
            response.render("coachManagement", {data: newCoach, status: "display", textAlert: "Hủy HLV thành công"})
        } else {
            let newCoach = await CheckCoach.find({}).lean();
            response.render("coachManagement", {data: newCoach, status: "display", textAlert: "Hủy HLV bị lỗi"})
        }

    }


});

app.get('/listOrder', async function (request, response) {
    let order = await Cart.find({}).lean();
    response.render('listOrder', {data: order, statusDisplay: "none"})
})

app.get('/listOrderDelivering', async function (request, response) {
    let order = await Cart.find({Status: "Đang giao"}).lean();
    response.render('listOrder', {data: order, statusDisplay: "none"})
})

app.get('/listOrderDelivered', async function (request, response) {
    let order = await Cart.find({Status: "Đã giao"}).lean();
    response.render('listOrderDelivered', {data: order, statusDisplay: "none"})
})

app.post('/doneOrder', (req, res) => {
    let id = req.body.idOrder;
    Cart.updateOne({_id: id}, {
            Status: "Đã giao"
        }, async function (err) {
            if (err == null) {
                let order = await Cart.find({Status: "Đã giao"}).lean();
                res.render('listOrderDelivered', {data:order, textAlert: "Set trạng thái đơn hàng thành công"});
            } else {
                let order = await Cart.find({Status: "Đang giao"}).lean();
                res.render('listOrder', {data: order, statusDisplay: "block", textAlert: "Lỗi Server"})
                console.log(err.message);
            }
        }
    )
});

app.post('/notDoneOrderYet', (req, res) => {
    let id = req.body.idOrder;
    Cart.updateOne({_id: id}, {
            Status: "Đang giao"
        }, async function (err) {
            if (err == null) {
                let order = await Cart.find({Status: "Đang giao"}).lean();
                res.render('listOrder', {data:order, textAlert: "Set trạng thái đơn hàng thành công"});
            } else {
                let order = await Cart.find({Status: "Đã giao"}).lean();
                res.render('listOrderDelivered', {data: order, statusDisplay: "block", textAlert: "Lỗi Server"})
                console.log(err.message);
            }
        }
    )
});

app.get('/notDoneOrderYet', async (req, res) => {
    let order = await Cart.find({Status: "Đang giao"}).lean();
    res.render('listOrder', {data:order, statusDisplay: "none"});
})

app.get('/doneOrder', async (req, res) => {
    let order = await Cart.find({Status: "Đã giao"}).lean();
    res.render('listOrderDelivered', {data:order, statusDisplay: "none"});
})


// app.post('/deleteOrder',  (req, res) => {
//     let id = req.body.idOrder;
//     Cart.deleteOne({_id: id}, async function (err) {
//         if (err == null) {
//             let cart = await Cart.find({}).lean();
//             res.render('listOrder', {data:cart,status: "display", textAlert: "Xóa order thành công"});
//         } else {
//             let cart = await Cart.find({}).lean();
//             res.render('listOrder', {data:cart,textAlert: err.message, status: "display"});
//         }
//     });
// });

// app.get('/deleteOrder', async function (req, res) {
//     let order = await Cart.find({}).lean();
//     res.render('listOrder', {data: order, status: "none"})
// });


// api for App

app.get('/getUser', async function (request, response) {

    let users = await User.find({}).lean();
    response.send(users);
});
app.get('/quantityUser', async function (request, response) {
    let users = await User.find({}).lean();
    response.send(users.length + "")
})
app.get('/loginApp', async function (request, response) {
    let userLogin = request.query.Username;
    let passwordLogin = request.query.Password;
    let user = await User.find({Username: userLogin, Password: passwordLogin}).lean();
    response.send(user);

});
app.get('/GetInforUser', async function (request, response) {
    let userOnline = request.query.userOnline
    let infor = await User.find({Username: userOnline}).lean();
    response.send(infor);
});

app.post('/signUpUser', async function (request, response) {
    let nUser = request.body.Username;
    let nPass = request.body.Password;
    let nFullname = request.body.Fullname;
    let nPhone = request.body.Phone;
    let nEmail = request.body.Email;
    let type = request.body.Type;
    let statusCoach = request.body.Status;
    let sex = request.body.Sex;
    let users = await User.find({Username: nUser}).lean();   //dk

    let newUser = new User({
        Username: nUser,
        Password: nPass,
        Fullname: nFullname,
        Phone: nPhone,
        Email: nEmail,
        Type: type,
        Status: statusCoach,
        Sex: sex
    });
    let status = await newUser.save();
    if (status) {
        response.send("Create Account Success");
    } else {
        console.log(status)
        response.send("Create Account Failure");
    }
});

app.post('/verifyPhoneNo', async function (request, response) {
    let nUser = request.body.Username;
    let nPhone = request.body.Phone;
    let nEmail = request.body.Email;
    let users = await User.find({Username: nUser}).lean();   //dk

    if (users.length <= 0) {
        let phone = await User.find({Phone: nPhone}).lean();   //dk
        let email = await User.find({Email: nEmail}).lean();   //dk
        if (phone.length > 0) {
            response.send("Số điện thoại đã được sử dụng");
        } else if (email.length > 0) {
            response.send("Email đã được sử dụng");
        } else {
            response.send("Confirm")
        }
    } else {
        console.log(users)
        response.send("Account already exists");
    }


});

app.post('/resetPass', async function (request, response) {
    let id = request.body._id;
    let nUser = request.body.Username;
    let nPass = request.body.Password;
    let nPhone = request.body.Phone;
    let nEmail = request.body.Email;
    console.log(id + "");

    let status2 = await User.find({Username: nUser, Phone: nPhone, Email: nEmail}).lean();
    if (status2.length > 0) {
        let stt = await User.findByIdAndUpdate(id, {Password: nPass});
        if (stt) {
            response.send("Reset Success")
        } else {
            response.send("Reset Fail")
        }
        //response.send("Correctly")
    } else {
        response.send("Incorrectly")
    }
});

app.post('/changePass', async function (request, response) {
    let id = request.body._id;
    let nUser = request.body.Username;
    let nPass = request.body.Password;
    console.log(id + "");
    let status = await User.find({Username: nUser, Password: nPass}).lean();
    console.log(status);
    if (status.length <= 0) {
        let stt = await User.findByIdAndUpdate(id, {Password: nPass});
        if (stt) {
            response.send("Change Success")
        } else {
            response.send("Change Fail")
        }
        //response.send("Correctly")
    } else {
        response.send("Duplicate")
    }
});


app.post('/updateProfile', async function (request, response) {

    let id = request.body._id;
    let fullname = request.body.Fullname;
    let email = request.body.Email;
    let sex = request.body.Sex;
    let users = await User.find({Fullname: fullname, Email: email, Sex: sex}).lean();
    if (users.length <= 0) {
        let newUser = await User.findByIdAndUpdate(id, {
            Fullname: fullname,
            Email: email,
            Sex: sex
        });
        console.log(newUser)
        if (newUser) {
            response.send('Update User Success')
        } else {
            response.send('Update User Failure')
        }
    } else {
        response.send('User already exists')
    }
});

app.get('/myProduct', async function (request, response) {
    let classify = request.query.Classify;
    let products = await Product.find({Classify: classify}).lean();
    response.send(products);
});

app.get('/allProduct', async function (request, response) {
    let products = await Product.find({}).lean();
    response.send(products);
});

app.get('/getCart', async function (request, response) {
    let username = request.query.Username;
    let cart = await Cart.find({Username: username}).lean();
    response.send(cart);
});

app.get('/getDeliveringCart', async function (request, response) {
    let username = request.query.Username;
    let cart = await Cart.find({Username: username, Status: "Đang giao"}).lean();
    response.send(cart);
});

app.get('/getDeliveredCart', async function (request, response) {
    let username = request.query.Username;
    let cart = await Cart.find({Username: username, Status: "Đã giao"}).lean();
    response.send(cart);
});


app.post('/upCart', async function (request, response) {
    let username = request.body.Username;
    let cart = request.body.Cart;
    let phone = request.body.Phone;
    let dateCart = request.body.DateCart;
    let recipients = request.body.Recipients;
    let receivingAddress = request.body.ReceivingAddress;
    let totalPrice = request.body.TotalPrice;
    let statuss = request.body.Status;
    let newCart = new Cart({
        Username: username,
        Cart: cart,
        Recipients: recipients,
        Phone: phone,
        ReceivingAddress: receivingAddress,
        DateCart: dateCart,
        TotalPrice: totalPrice,
        Status: statuss
    });
    let status = newCart.save();
    if (status) {
        response.send("Up Cart Success")
    } else {
        response.send("Up Cart Failure")
    }

})


app.get('/getAllCoach', async function (request, response) {
    let coach = await User.find({Type: "Coach", Status: "Updated"}).lean();
    response.send(coach);

});


app.post('/checkInforCoach', async function (request, response) {
    file(request, response, async function (err) {
        if (err) {
            // kiem tra loi co phai la max file ko
            if (err instanceof multer.MulterError) {
                response.send('kích thước file lớn hơn 2mb' + response)
            } else {
                response.send('' + err)
            }

        } else {
            let id = request.body._id;
            let CoachName = request.body.Fullname;
            let username = request.body.Username;
            console.log("Username" + username);
            let ImageProfile = request.file.filename;
            let Workplace = request.body.Workplace;
            let Address = request.body.Address;
            let Background = request.body.Background;
            let Age = request.body.Age;
            let Specialized = request.body.Specialized;
            let statusUpdate = request.body.Status;
            let token = request.body.Token;
            console.log(Address)
            let update = await User.findByIdAndUpdate(id, {
                Status: statusUpdate,

            });
            let newCheckCoach = new CheckCoach({
                _id: id,
                CoachName: CoachName,
                ImageProfile: ImageProfile,
                Workplace: Workplace,
                Specialized: Specialized,
                Age: Age,
                Background: Background,
                Token: token,
                Username: username,
                Address: Address

            });
            let stt = await newCheckCoach.save();
            if (stt) {
                let checkCoach = await CheckCoach.find().lean();
                response.render("coachManagement", {data: checkCoach, status: "none"});
            } else {
                response.send("Fails")
            }
        }

    })


});

app.post('/matchCoach', async function (request, response) {
    let place = request.body.Workplace;
    let specialized = request.body.Specialized;
    let sex = request.body.Sex;
    let ageFrom = request.body.AgeFrom;
    let ageTo = request.body.AgeTo;
    let user = await User.find({
        $or: [
            {$and: [{Workplace: place}, {Specialized: specialized}, {$and: [{Age: {$gte: ageFrom}}, {Age: {$lte: ageTo}}]}, {Sex: sex}]},
            {$and: [{Workplace: place}, {Specialized: specialized}, {$and: [{Age: {$gte: ageFrom}}, {Age: {$lte: ageTo}}]}]},
            {$and: [{Workplace: place}, {Specialized: specialized}, {Sex: sex}]},
            {$and: [{Workplace: place}, {Specialized: specialized}]}
        ]
    });
    console.log(user);
    response.send(user);

});

app.get("/getAllNotification", async function (request, response) {
    let username = request.query.Username;
    let notification = await Notification.find({Username: username}).lean();
    response.send(notification);
});

app.get("/getCoachForType", async function (request, response) {
    let specialized = request.query.Specialized;
    let coach = await User.find({Specialized: specialized, Type: "Coach", Status: "Updated"})
    response.send(coach);

});

app.get("/getHotCoach", async function (request, response) {
    let coach = await User.find({Type: "Coach", Status: "Updated", Rating: "5"})
    response.send(coach);

});

app.post("/switchCoach", async function (request, response) {
    let status = request.body.Status;
    let id = request.body._id
    console.log(id);
    console.log(status);
    let stt = await User.findByIdAndUpdate(id, {Status: status});
    if (stt.length > 0) {
        response.send("Done Change");
    } else {
        response.send("Fail Change");
    }


});

app.post("/checkPhoneNo", async function (request, response) {

    let Phone = request.body.Phone
    let stt = await User.find({Phone: Phone});
    if (stt.length > 0) {
        response.send("Have PhoneNo");
    } else {
        response.send("No PhoneNo");
    }

});

app.post("/getInforFromPhone", async function (request, response) {
    let Phone = request.body.Phone
    let user = await User.find({Phone: Phone});
    response.send(user);

});

app.post("/sendReportFromUser", async function (request, response) {
    let username = request.body.Username;
    let content = request.body.Content;
    let detail = request.body.Detail;
    let token = request.body.Token;
    let newReport = await new Report({
        Username: username,
        Content: content,
        Detail: detail,
        Token: token,
        Status: "No Feedback",

    });
    let stt = await newReport.save();
    if (stt) {
        let report = await Report.find({Status: "No Feedback"}).lean();
        response.render("report", {data: report});
    }

});



