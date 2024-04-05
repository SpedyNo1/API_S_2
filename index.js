// var Minio = require("minio");
// var minioClient = new Minio.Client({
//   endPoint: "localhost",
//   port: 9000,
//   useSSL: false,
//   accessKey: "vYrO41bFPhqSvzr5nmgf",
//   secretKey: "kSOAb5mY6myJttPtXT8ROLI3bEpc7hu28p1i35o5",
// });
// const metaData = {
//   "Content-Type": "application/octet-stream",
//   "X-Amz-Meta-Testing": 1234,
//   example: 5678,
// };
// let name_f = "mock";
// function uploadFile(e, name) {
//   //const filePath = './test.jpg'
//   const bucketName = "test";
//   const objectName = "/" + name_f + "/" + name;
//   minioClient.fPutObject(
//     bucketName,
//     objectName,
//     e,
//     metaData,
//     function (err, etag) {
//       if (err) {
//         return console.log(err);
//       }
//       console.log("File uploaded successfully.");
//     }
//   );
// }
// // Call the upload function
// uploadFile('./test.jpg','test1.png')
// uploadFile('./t.png','test2.png')
//uploadFile('./uploads/Screenshot 2024-03-26 232916.png','test1.png') `${Date.now()}-
// const AWS = require('aws-sdk');
const fs = require('fs');
// const s3 = new AWS.S3({
//     endpoint: "https://e5520b7e83bfebef0f7af36d88823aaf.r2.cloudflarestorage.com/",
//     accessKeyId: "8adeb206bf5b7ae09f692d07b205fffc",
//     secretAccessKey: "af11f5dbafcb6d2c9da8da433a33faaa3c8273fc641644f2045d94be00a7d4ae",
//     region: "apac",
// });
// const params = {
//   Bucket: "mocksolar/test",
//   Key: "1238de67.jpg", // Specify a unique key for the image file
//   Body: fs.createReadStream("./test.jpg"), // Read the image file as a stream
//   ContentType: 'image/jpg' // Specify the content type of the image
// };
// console.log(typeof(params.Body))
// s3.upload(params, (err, data) => {
//   if (err) {
//     console.error('Error uploading image:', err);
//   } else {
//     console.log('Image uploaded successfully:', data.Location);
//   }
// });


const AWS = require("aws-sdk");
async function uploadImageToS3(bucketName, key, imagePath, contentType) {
  const s3 = new AWS.S3({
    endpoint: "https://e5520b7e83bfebef0f7af36d88823aaf.r2.cloudflarestorage.com/",
    accessKeyId: "8adeb206bf5b7ae09f692d07b205fffc",
    secretAccessKey: "af11f5dbafcb6d2c9da8da433a33faaa3c8273fc641644f2045d94be00a7d4ae",
    region: "apac",
  });
  const params = {
    Bucket: bucketName,
    Key: key,
    Body: fs.createReadStream(imagePath),
    ContentType: contentType,
  };

  // Upload the image to S3
  s3.upload(params, (err, data) => {
    if (err) {
      console.error("Error uploading image:", err);
    } else {
      console.log("Image uploaded successfully");
    }
  });
}
async function deleteObjectsWithPrefix(bucketName, prefix) {
  const s3 = new AWS.S3({
    endpoint: "https://e5520b7e83bfebef0f7af36d88823aaf.r2.cloudflarestorage.com/",
    accessKeyId: "8adeb206bf5b7ae09f692d07b205fffc",
    secretAccessKey: "af11f5dbafcb6d2c9da8da433a33faaa3c8273fc641644f2045d94be00a7d4ae",
    region: "apac",
  });

  try {
    const data = await s3.listObjectsV2({
      Bucket: bucketName,
      Prefix: prefix // prefix to match objects
    }).promise();

    if (data.Contents.length === 0) {
      console.log('No objects found with the prefix:', prefix);
      return;
    }

    const objectsToDelete = data.Contents.map(obj => ({ Key: obj.Key }));

    const deletionParams = {
      Bucket: bucketName,
      Delete: {
        Objects: objectsToDelete
      }
    };

    await s3.deleteObjects(deletionParams).promise();
    console.log('All objects with prefix', prefix, 'deleted successfully');
  } catch (err) {
    console.error('Error:', err);
  }
}
//deleteObjectsWithPrefix("mocksolar", "DJI/");
//uploadImageToS3("mocksolar/test", "jnfdgn.jpg", "./uploads/S__25526312.jpg", "image/jpeg");


const express = require("express");
const multer = require("multer");
const cors = require("cors");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    const fileName = `${file.originalname}`;
    cb(null, fileName);
  },
});
const upload = multer({
  storage: storage,
});
const app = express();
app.use(cors());
const port = 3000;
// app.post('/upload', upload.single('test'), (req, res) => {
//   res.send(req.file.originalname)
//   console.log('./uploads/'+req.file.originalname)
//   uploadFile('./uploads/'+req.file.originalname,req.file.originalname)
// });

app.post("/upload", upload.array("photos", 1000), function (req, res, next) {
  // req.files is array of `photos` files
  // req.body will contain the text fields, if there were any
  //res.send(req.file.originalname)
  for (let i = 0; i < req.files.length; i++) {
    uploadImageToS3("mocksolar/fuse123", req.files[i].originalname, "./uploads/" + req.files[i].originalname, req.files[i].mimetype);
    //fs.unlinkSync("./uploads/" + req.files[i].originalname)
  }
  console.log(req.files);
  res.send("File uploaded successfully");
});
app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
app.get('/upload-form', (req, res) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>File Upload</title>
        <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
      </head>
      <body>
        <input type="file" id="fileInput" multiple accept=""/>
        <button onclick="uploadFile()">Upload</button>
        <progress
          id="uploadProgress"
          max="100"
          value="0"
          style="width: 100%"
        ></progress>
        <script>
          const uploadFile = async () => {
            const fileInput = document.getElementById("fileInput");
            const file_select = fileInput.files[0];
            console.log(fileInput.files);
            console.log(fileInput.files.length);
            // if (file_select.type !== "image/png") {
            //   alert("Your file not PNG");
            //   return false;
            // }
            if (!fileInput.files.length) {
              return alert('Please choose a file to upload')
            }
            // if (file_select.size > 1024 * 1024 * 2) {
            //   alert("Your file size Over 2MB");
            //   return false;
            // }
            //console.log(length(fileInput.files))
            const formData = new FormData();
            for(let i=0;i<fileInput.files.length;i++){
              formData.append("photos", fileInput.files[i]);
            }
            try {
              const response = await axios.post(
                "https://api-s3.onrender.com/upload",
                formData,
                {
                  headers: {
                    "Content-Type": "multipart/form-data",
                  },
                  onUploadProgress: function (progressValue) {
                  uploadProgress.value = progressValue.progress * 100;
                  console.log(progressValue.progress);
                  },
                }
              );
            } catch (error) {
              console.log("error", error);
              alert("Error uploading file");
            }
          };
        </script>
      </body>
    </html>
  `;
  res.send(htmlContent);
});
