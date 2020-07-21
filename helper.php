<?php
class helper{
    public function gallery_data(){
        $files = glob("uploads/*.{jpg,png}", GLOB_BRACE);
        $response = array();
        if(count($files) > 0){
            $html = '';
            foreach($files as $item){
                $fileName = basename($item);
                $html .= '<div class="item-list"><img onclick=editTriggerMethod("'.$fileName.'") src="'.$item.'" width="200"/><label class="image-file-name">'.$fileName.'</label><button title="click to delete" id="btnRemoveCurrentImage" onclick=removeCurrentImage("'.$fileName.'")><span></span></button></div>';
            }
            if(count($files) == 1){
                $response['item_found'] = '<h3 class="item-found-counter">1 Item</h3>';
            } else {
                $response['item_found'] = '<h3 class="item-found-counter">'.count($files).' Items</h3>';
            }
            $response['content'] = $html;
        } else {
            $response['content'] = false;
        }
        echo json_encode($response);
    }

    public function upload(){
        try{
            $error_trigger = 0;
            $files = glob("uploads/*.{jpg,png}", GLOB_BRACE);
            if(count($files) > 0){
                $fileNameIncrementCounter = count($files);
            } else {
                $fileNameIncrementCounter = 0;
            }
            // moves uploaded file to the directory //
            foreach($_FILES['formFiles']['tmp_name'] as $key => $value){
                $fileNameIncrementCounter++;
                // generating random value //
                //$randomIntValue = rand(1000, 9999);
                $randomString = $this->generateRandomString(4);
                // getting file extension here //
                $target_file = "uploads/" . basename($_FILES["formFiles"]["name"][$key]);
                $imageFileType = strtolower(pathinfo($target_file,PATHINFO_EXTENSION));
                // setting upload path //
                $uploadPath = "uploads/image-file-".$randomString."-".$fileNameIncrementCounter.".".$imageFileType;
                //move_uploaded_file($value, $uploadPath)
                if(move_uploaded_file($value, $uploadPath)){
                    /*
                        just copying this same files to default directory. without this we cant get the original files again
                    */
                    $uploadPathOriginalDirectory = "uploads/original_files/image-file-".$randomString."-".$fileNameIncrementCounter.".".$imageFileType;
                    copy($uploadPath, $uploadPathOriginalDirectory);
                } else {
                    $error_trigger++;
                }
            }
            if($error_trigger == 0){
                echo "success";
            } else {
                echo "error";
            }
        } catch(Exception $e){
            echo "error";
        }
    }

    public function generateRandomString($length = 10) {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $charactersLength = strlen($characters);
        $randomString = '';
        for ($i = 0; $i < $length; $i++) {
            $randomString .= $characters[rand(0, $charactersLength - 1)];
        }
        return $randomString;
    }

    public function save_edited_image(){
        if(isset($_POST['hdn_canvas_data_url'])){
            $img = $_POST['hdn_canvas_data_url'];
            $img = str_replace('data:image/png;base64,', '', $img);   
            $img = str_replace(' ', '+', $img);   
            $data = base64_decode($img);   
        
            $file = 'uploads/'.$_POST['hdn_image_id'];   
            $success = file_put_contents($file, $data);
            print $success ? $file : 'Unable to save the file.';
        } 
    }

    public function delete_files(){
        try{
            $file = 'uploads/'.$_POST['hdn_image_id'];   
            $success = unlink($file);   
        
            $file_original = 'uploads/original_files/'.$_POST['hdn_image_id'];   
            $success_for_original = unlink($file_original);
        
            print $success ? true : 'Unable to delete the file.';   
        } catch(Exception $e){
            print 'Caught exception: '.$e->getMessage();
        }
    }
}

$API = new helper;
header('Content-Type: text/html; charset=UTF-8');

if(isset($_GET['action']) && $_GET['action'] == 'upload'){
    echo $API->upload();
} elseif(isset($_GET['action']) && $_GET['action'] == 'init'){
    echo $API->gallery_data();
} elseif(isset($_GET['action']) && $_GET['action'] == 'edit'){
    echo $API->save_edited_image();
} elseif(isset($_GET['action']) && $_GET['action'] == 'delete'){
    echo $API->delete_files();
}