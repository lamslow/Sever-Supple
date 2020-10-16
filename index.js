let express=require('express');
let hbs=require('express-handlebars');
let db = require('mongoose');
let userSchema = require('./model/userSchema');
let productSchema = require('./model/productSchema');
let AdministratorSchema = require('./model/AdministratorSchema');
let cartSchema=require('./model/cartSchema');
let User = db.model('User', userSchema, 'users');
let Product = db.model('Product', productSchema, 'products');
let Administrator=db.model('Administrator',AdministratorSchema,'administrator');
let Cart=db.model("Cart",cartSchema,'cart');
let body=require('body-parser');
let multer=require('multer')
db.connect('mongodb+srv://lamntph07140:123456ab@cluster0-kylu8.gcp.mongodb.net/databaseAss', {}).then(function (res) {
    console.log('conected');
})

let app=express();
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
app.post('/upload',function (req, res) {
    file(req, res,function (err) {


        if (err){
            if (req.files.length >=5) {
                res.render("upsanpham", {data:"Số lượng file không được lớn hơn 5"});
            }

            else if (err instanceof multer.MulterError){
                res.render("upsanpham", {data:"Giới hạn 2MB"});
            }

            else {

                res.render("upsanpham", {data:err});

            }


        }else {
            res.render("upsanpham", {data:'Upload ảnh thành công. Kiểm tra thư mục uploads'});

        }
    })
});
let path = require('path');
app.use('/public', express.static(path.join(__dirname, 'public')))
app.use(body.json());
app.use(body.urlencoded({extended:true}));
app.engine('.hbs',hbs({
    extname: 'hbs',
    defaultLayout: '',
    layoutsDir:''
}));

app.set('view engine','.hbs');
app.listen(1212);
app.get('/',function (request,response) {

    response.render("login");
});
app.get('/createAdmin', async function (request, response) {
    let nUserAd = request.query.nUserAd;
    let nPassAd = request.query.nPassAd;
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
app.get('/signUpAdmin', async function (request, response) {
    let update = request.query.update;
    console.log(update + '')
    if (update == 1) {
        update = 0;

        let idAd = request.query.idAd;
        let userAd = request.query.userAd;
        let passAd = request.query.passAd;
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
app.get('/login', async function (request, response) {
    let userAdmin = request.query.userAdmin;
    let passwordAdmin = request.query.passwordAdmin;
    let sm = request.query.sm;

    if (sm == 1) {
        nameDN = user;
        console.log(user + " " + sm);
    }

    let administrator = await Administrator.find({userAdmin: userAdmin, passwordAdmin: passwordAdmin}).lean();   //dk

    if (administrator.length <= 0 && sm == 1) {
        response.rsender('login', {
            status: 'block',
            data: 'Không thể đăng nhập, kiểm tra lại tài khoản và mật khẩu của bạn.',
            user: '',
            pass: ''
        });
    } else {
        response.render('sanpham');
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
    let idAd = request.query.idAd;
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

        let products = await Product.find({}).lean();
        response.render('sanpham', {data: products});
});//done

app.get('/qlysanpham', async function (request, response) {
    let products = await Product.find({}).lean();
    response.render('qlysanpham', {data: products});
});



app.get('/upsanpham', async function (request, response) {
        response.render('upsanpham', {status: 'none'});

});


app.post('/uploadProduct',  (request, response) => {

    file(request, response,async function (err) {
        if (err){
                // kiem tra loi co phai la max file ko
                if (err instanceof multer.MulterError) {
                    response.send('kích thước file lớn hơn 2mb' + response)
                } else {
                    response.send('' + err)
                }

        }else {
            let nameSP = request.body.nameSP;
            let priceSP = request.body.priceSP;
            let descriptionSP = request.body.descriptionSP;
            let slSP = request.body.slSP;
            let classify= request.body.classifySP;
            let image = request.file.filename;
            let products = await Product.find({
                ProductName: nameSP,
                Price: priceSP,
                Description: descriptionSP,
                Quantity: slSP,
                Classify: classify,
                ImageProduct: image
            }).lean();
            if (products.length <= 0) {
                let addProduct = new Product({
                    ProductName: nameSP,
                    Price: priceSP,
                    Description: descriptionSP,
                    Quantity: slSP,
                    Classify: classify,
                    ImageProduct: image
                });
                let status = addProduct.save();
                if (status) {
                    response.render('upsanpham', {status: 'block', data: 'Thêm sản phẩm ' + nameSP + ' thành công.'});

                } else {
                    response.render('upsanpham', {status: 'block', data: 'Thêm sản phẩm ' + nameSP + ' thất bại.'});

                }
            }else {
                response.render('upsanpham', {
                    status: 'block',
                    data: 'Thêm sản phẩm ' + nameSP + ' thất bại. Sản phẩm đã tồn tại.'
                });
            }

        }
    })


});


app.get('/updatesanpham', async function (request, response) {

    let update = request.query.update;
    console.log(update + '')
    if (update == 1) {
        update = 0;

        let idSP = request.query.idSP;
        let imageSP = request.query.exImage;
        let nameSP = request.query.nameSP;
        let priceSP = request.query.priceSP;
        let descriptionSP = request.query.descriptionSP;
        let classifySP= request.query.classifySP;
        let slSP = request.query.slSP;

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
            classifySP:classifySP,
            slSP: slSP,
        });
    }


});
app.get('/updateSPdone', async function (request, response) {
    let nId = request.query.nId;
    let nameSP = request.query.nameSP;
    let priceSP = request.query.priceSP;
    let exImage = request.query.exImage;
    let descriptionSP = request.query.descriptionSP;
    let classifySP= request.query.classifySP;
    let slSP = request.query.slSP;
    let products = await Product.find({
        ProductName: nameSP,
        Price: priceSP,
        Description: descriptionSP,
        Quantity: slSP,
        Classify:classifySP,
        ImageProduct: exImage
    }).lean();   //dk
    if (products.length <= 0) {
        console.log(nId + "edit sp");
        let status = await Product.findByIdAndUpdate(nId, {
            ProductName: nameSP,
            Price: priceSP,
            Description: descriptionSP,
            Quantity: slSP,
            Classify:classifySP,
            ImageProduct: exImage
        });
        let nProduct = await Product.find({}).lean();
        if (status) {
            response.render('qlysanpham', {
                data: nProduct,
                status: 'block',
                textAlert: 'Cập nhật sản phẩm thành công.'
            });
        } else {
            response.render('qlysanpham', {
                data: nProduct,
                status: 'block',
                textAlert: 'Cập nhật sản phẩm thất bại.'
            });
        }
    } else {
        let nProduct = await Product.find({}).lean();
        response.render('qlysanpham', {
            data: nProduct,
            status: 'block',
            textAlert: 'Cập nhật sản phẩm thất bại. Sản phẩm cập nhật đã tồn tại.'
        });
    }
});
app.get('/delsanpham', async function (request, response) {

    let idSP = request.query.idSP;
    console.log(idSP + "del Sp");

    let status = await Product.findByIdAndDelete(idSP);
    let nProduct = await Product.find({}).lean();
    if (status) {
        response.render('qlysanpham', {
            data: nProduct,
            status: 'block',
            textAlert: 'Xóa sản phẩm thành công.'
        });
    } else {
        response.render('qlysanpham', {
            data: nProduct,
            status: 'block',
            textAlert: 'Xóa sản phẩm thất bại.'
        });
    }
});


app.get('/qlykhachhang', async function (request, response) {
    let users = await User.find({}).lean();
        response.render('quanlykhachhang', {data: users, status: 'none'});

});
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
app.post('/updateKH', async function (request, response)
{

    let idKH = request.body.nIdKH;
    let userKH = request.body.nUserKH;
    let passKH = request.body.nPassKH;
    let FullnameKH = request.body.nFullname;
    let PhoneKH = request.body.nPhone;
    let AddressKH = request.body.nAddress;
    let EmailKH = request.body.nEmail;

    let users = await User.find({Username: userKH, Password: passKH,Fullname: FullnameKH
        ,Phone: PhoneKH, Email: EmailKH, Address: AddressKH}).lean();   //dk
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
    let idKH = request.query.idKH;


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



// api for App
let userOnline="";

app.get('/getUser', async function (request, response) {
    let username=request.query.Username;
    let users = await User.find({Username:username}).lean();
    response.send(users);
});
app.get('/quantityUser',async function (request,response){
    let users = await User.find({}).lean();
    response.send(users.length+"")
})
app.get('/loginApp',    async function (request, response) {
    let userLogin = request.query.Username;
    let passwordLogin = request.query.Password;
    let stt=await Administrator.find({userAdmin:userLogin,passwordAdmin:passwordLogin}).lean();
    if (stt.length>0){
        response.send("Admin")
    }else {
        let status = await User.find({Username: userLogin, Password: passwordLogin}).lean();   //dk
        if (status.length >0) {
            userOnline=userLogin;
            response.send("Success");
        } else {
            response.send('Fail');
        }
    }

});
app.get('/GetInforUser', async function (request, response) {
    let infor=await User.find({Username:userOnline}).lean();
    response.send(infor);
});


app.post('/signUpUser', async function (request, response) {
    let nUser = request.body.Username;
    let nPass = request.body.Password;
    let nFullname = request.body.Fullname;
    let nPhone = request.body.Phone;
    let nEmail = request.body.Email;
    let nAddress = request.body.Address;
        let users = await User.find({Username: nUser}).lean();   //dk
        if (users.length <= 0) {
            let stt=await User.find({Phone:nPhone,Email:nEmail}).lean();
            console.log(stt)
            if (stt.length>0){
                response.send("Email hoặc Số điện thoại đã được sử dụng");
            }else {
                let newUser = new User({
                    Username: nUser,
                    Password: nPass,
                    Fullname: nFullname,
                    Phone: nPhone,
                    Email: nEmail,
                    Address: nAddress,
                });
                console.log("1")
                let status = await newUser.save();
                if (status) {
                    console.log("aa")
                    response.send( "Create Account Success");
                } else {
                    console.log(status)
                    response.send("Create Account Failure");
                }
            }

        } else {
            console.log(users)
            response.send("Account already exists");
        }



});

app.post('/resetPass', async function (request,response){
    let id=request.body._id;
    let nUser=request.body.Username;
    let nPass=request.body.Password;
    let nPhone = request.body.Phone;
    let nEmail = request.body.Email;
    console.log(id+"");
    let status=await User.find({Username:nUser,Phone:nPhone,Email:nEmail}).lean();
    if(status.length>0){
        let stt=await User.findByIdAndUpdate(id,{Password:nPass});
        if (stt){
            response.send("Reset Success")
        }else {
            response.send("Reset Fail")
        }
           //response.send("Correctly")
    }else {
        response.send("Incorrectly")
    }
});

app.post('/changePass', async function (request,response){
    let id=request.body._id;
    let nUser=request.body.Username;
    let nPass=request.body.Password;
    console.log(id+"");
    let status=await User.find({Username:nUser,Password:nPass}).lean();
    console.log(status);
    if(status.length<=0){
        let stt=await User.findByIdAndUpdate(id,{Password:nPass});
        if (stt){
            response.send("Change Success")
        }else {
            response.send("Change Fail")
        }
        //response.send("Correctly")
    }else {
        response.send("Duplicate")
    }
});


app.post('/updateProfile',async function (request,response){

    let idKH = request.body.nIdKH;
    let FullnameKH = request.body.Fullname;
    let PhoneKH = request.body.Phone;
    let AddressKH = request.body.Address;
    let EmailKH = request.body.Email;
    console.log(idKH)
    let users = await User.find({Fullname: FullnameKH,Phone: PhoneKH, Email: EmailKH, Address: AddressKH}).lean();
    console.log(users)
    if (users.length<=0){
        let newUser=await User.findByIdAndUpdate(idKH,{
            Fullname: FullnameKH,
            Phone: PhoneKH,
            Address: AddressKH,
            Email: EmailKH
        });
        console.log(newUser)
        if (newUser){
            response.send('Update User Success')
        }else {
            response.send('Update User Failure')
        }
    }else {
        response.send('User already exists')
    }
});



app.get('/myProduct', async function (request, response) {
    let classify=request.query.Classify;
    let products = await Product.find({Classify:classify}).lean();
    response.send(products);
});

app.get('/getCart', async function (request,response){
    let cart=await Cart.find({}).lean();
    response.send(cart);
});

app.post('/upCart',async function (request,response){
    let username=request.body.Username;
    // let name=request.body.Name;
    let cart=request.body.Cart;
    console.log(cart);
    // let quantity=request.body.Quantity;
    // let price=request.body.Price;
    let dateCart=request.body.DateCart;
    let recipients=request.body.Recipients;
    let receivingAddress=request.body.ReceivingAddress;

    let newCart=new Cart({
        Username:username,
        Cart:cart,
        Recipients:recipients,
        ReceivingAddress:receivingAddress,
        DateCart:dateCart
    });
    let status=newCart.save();
    if (status){
        response.send("Up Cart Success")
    }else {
        response.send("Up Cart Failure")
    }
    
})