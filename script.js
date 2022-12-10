canvas = {
    frontBuffer : {},
    backBuffer : {},

    init : function(canvas,img){
    
        this.ctx = canvas.getContext('2d',{willReadFrequently:true})
        this.ctx.imageSmoothingEnabled = false;

        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight

        this.width =  canvas.width
        this.height = canvas.height

        
        this.x1 = 0
        this.y1 = 0
        this.sw = this.width
        this.sh = this.height
       
        this.rect = function (){
            this.ctx.rect(0,0,this.width,this.height)
        }

        this.fillStyle = function(value){
            this.ctx.fillStyle = value
        }

        this.fill = function(){
            this.ctx.fill()
        }

        this.swapBuffer = function(){
            temp = this.frontBuffer
            this.frontBuffer = this.backBuffer
            this.backBuffer = temp

            this.ctx.clearRect(0,0,this.width,this.height)
            this.ctx.putImageData(this.dataToImage(this.frontBuffer),this.x1,this.y1)
            //this.frontBuffer = this.imageToData(this.ctx.getImageData(this.x1,this.y1,this.sw,this.sh))
        }

        this.reloadBuffer = function(){
            this.ctx.clearRect(0,0,this.width,this.height)
            this.ctx.putImageData(this.dataToImage(this.frontBuffer),this.x1,this.y1)

            //this.frontBuffer = this.imageToData(this.ctx.getImageData(this.x1,this.y1,this.sw,this.sh))
        }

        this.loadBuffer = function(data){
            this.backBuffer.isGrayScale = this.frontBuffer.isGrayScale = data.isGrayScale
            
            dif = data.pad + this.frontBuffer.width + this.frontBuffer.pad 
            for(k = 2 ; k >= 0 ; k--){
                for(i = this.frontBuffer.pad; i <= this.frontBuffer.height + this.frontBuffer.pad; i++){
                    for(j = data.pad - this.frontBuffer.pad; j <= dif; j++){
                        this.frontBuffer.data[k][i][j] = data.data[k][i][j]
                      
                    }
                
                }
            }
            
            this.reloadBuffer()
        }

        this.addImageToBuffer = function(img){
            canvas = document.createElement('canvas')
            canvas.height = img.naturalHeight
            canvas.width = img.naturalWidth
            ctx = canvas.getContext('2d',{willReadFrequently:true})

            
            ctx.drawImage(img,0,0,canvas.width,canvas.height)
            data = this.imageToData(ctx.getImageData(0,0,canvas.width,canvas.height))

            xd = data.width > this.frontBuffer.width ? this.frontBuffer.width : data.width
            yd = data.height > this.frontBuffer.height ? this.frontBuffer.height : data.height
            
            for(k = 2 ; k >= 0 ; k--){
                if(this.frontBuffer.isGrayScale){
                    k = 0 
                }

                for(i = this.frontBuffer.pad ; i < yd + this.frontBuffer.pad ; i++ ){
                  
                    for( j = this.frontBuffer.pad ; j < xd + this.frontBuffer.pad ; j++){
                        this.frontBuffer.data[k][i][j] += data.data[k][i - this.frontBuffer.pad][j - this.frontBuffer.pad]
                    }
                    
                }
            }

            this.reloadBuffer()
        }

        this.createDataStruct = function(imageData){
            data = {}
            data.height = imageData.height
            data.width = imageData.width
            data.isGrayScale = false
            data.pad = 0
            data.data = [[],[],[],[]]
            
            for(i = 0 ; i < (imageData.height); i++){
                data.data[0].push(new Array(imageData.width))
                data.data[1].push(new Array(imageData.width))
                data.data[2].push(new Array(imageData.width))
                data.data[3].push(new Array(imageData.width))
            }
            
            return data
        }

        this.applyPadding = function(imageData, pad = 0){
          
            for(i = 0 ; i < pad ; i++){
                for(k = 0 ; k < 4 ; k++){
                    for(j = 0 ; j < imageData.height ; j++){
                        imageData.data[k][j].push(imageData.data[k][j][imageData.data[k][j].length - 1])
                        imageData.data[k][j].unshift(imageData.data[k][j][0])
                    }
                }  
                imageData.pad += 1
            }

            for(i = 0 ; i < pad ; i++){
                for( k =0 ; k < 4 ; k++){
                    imageData.data[k].unshift(imageData.data[k][0])
                    imageData.data[k].push(imageData.data[k][imageData.data[k].length - 1])
                }
            }
        }

        this.removePadding = function(imageData, unpad = 0){
            for(i = 0 ; i < unpad ; i++){
                for( k =0 ; k < 4 ; k++){
                    imageData.data[k].pop()
                    imageData.data[k].shift()
                }
                imageData.pad -= 1
            }
            for(i = 0 ; i < unpad ; i++){
                for(k = 0 ; k < 4 ; k++){
                    for(j = 0 ; j < (imageData.height + 2 * imageData.pad); j++){
                        imageData.data[k][j].pop()
                        imageData.data[k][j].shift()
                    }
                }  
            }
        }

        this.imageToData = function(imageData){
            imageBuffer = this.createDataStruct(imageData)
            count = 0

            for(i = 0 ; i < imageBuffer.height ; i++){
                for( j = 0 ; j  < imageBuffer.width ; j++){
                    imageBuffer.data[0][i][j] = imageData.data[count]
                    imageBuffer.data[1][i][j] = imageData.data[count+1]
                    imageBuffer.data[2][i][j] = imageData.data[count+2]
                    imageBuffer.data[3][i][j] = imageData.data[count+3]
                    count += 4
                }    
            }
            return imageBuffer
        }

        this.dataToImage = function(data){
            img = new ImageData(data.width,data.height)
            
            count = 0
            if(data.isGrayScale){
                for(i = data.pad ; i < (data.height + data.pad); i++){
                    for( j = data.pad ; j < (data.width + data.pad) ; j++){
                        img.data[count] = img.data[count+1] = img.data[count+2] = data.data[0][i][j]
                        img.data[count+3] = data.data[3][i][j]
                        count += 4
                    }
                }
            }
            else{
                for(i = data.pad ; i < (data.height + data.pad); i++){
                    for( j = data.pad ; j < (data.width + data.pad) ; j++){
                        img.data[count] = data.data[0][i][j]
                        img.data[count+1] = data.data[1][i][j]
                        img.data[count+2] = data.data[2][i][j]
                        img.data[count+3] = data.data[3][i][j]
                        count += 4
                    }
                }
            }
            
            return img
        }



        this.toGrayScale = function(reload=true){
            if(this.frontBuffer.isGrayScale){
                return
            }
            else{
                this.frontBuffer.isGrayScale = true
                for(i = this.frontBuffer.pad ; i < this.frontBuffer.height + this.frontBuffer.pad ; i++){
                    for(j = this.frontBuffer.pad ; j < this.frontBuffer.width + this.frontBuffer.pad ; j++){
                        this.frontBuffer.data[0][i][j] = Math.floor((this.frontBuffer.data[0][i][j] * 0.3 +  this.frontBuffer.data[1][i][j] * 0.59 + this.frontBuffer.data[2][i][j] * 0.11))
                    }
                } 
            }

            if(reload) this.reloadBuffer()
        }

        this.toBlackWhite = function(){
            this.toGrayScale(false)
            
            hist = new Array(256).fill(0)

            for(i = this.frontBuffer.pad ; i < (this.frontBuffer.height + this.frontBuffer.pad); i++){
                for(j = this.frontBuffer.pad ; j < (this.frontBuffer.width + this.frontBuffer.pad); j++){
                    hist[this.frontBuffer.data[0][i][j]] += 1
                }
            }

            //Global thresholding
            t1 = 126
            t2 = 126
            do{
                t1 = t2,s1 = 0,c1 = 0,s2 = 0,c2 = 0
                for(i = 0 ; i < t2 ; i++){
                    s1 += hist[i] * i
                    c1  += hist[i]
                }

                for(i = t2 ; i < 256 ; i++){
                    s2 += hist[i] * i
                    c2  += hist[i]
                }

                m1 = s1/c1
                m2 = s2/c2

                t2 = Math.floor((m1 + m2)/2)
                
            }while(Math.abs(t1 - t2) > 3)
            
            for(i = this.frontBuffer.pad ; i < this.frontBuffer.height + this.frontBuffer.pad;  i++){
                for(j = this.frontBuffer.pad ; j <this.frontBuffer.width + this.frontBuffer.pad ; j++){
                    this.frontBuffer.data[0][i][j] = this.frontBuffer.data[0][i][j] > t2 ? 255 : 0
                }
            }   

            this.reloadBuffer()
        }

        this.toNegative = function(){
            for(k = 2 ; k >= 0 ; k--){
                if(this.frontBuffer.isGrayScale){
                    k = 0
                }
                   
                for(i = this.frontBuffer.pad; i < this.frontBuffer.height + this.frontBuffer.pad ; i++){
                    for (j = this.frontBuffer.pad ; j < this.frontBuffer.width + this.frontBuffer.pad; j++){
                        this.frontBuffer.data[k][i][j] = 255 - this.frontBuffer.data[k][i][j]
                    }
                }
            }

            this.reloadBuffer()
        }

        this.pixelIterator = function(callback){
            for(k = 2 ; k >= 0 ; k--){
                if(this.frontBuffer.isGrayScale){
                    k = 0
                    this.backBuffer.isGrayScale = true
                }
                   
                for(i = this.frontBuffer.pad; i < this.frontBuffer.height + this.frontBuffer.pad ; i++){
                    for (j = this.frontBuffer.pad ; j < this.frontBuffer.width + this.frontBuffer.pad; j++){
                        this.backBuffer.data[k][i][j] = callback(this.frontBuffer,i,j,k)
                    }

                    for(p = 0 ; p < this.backBuffer.pad ; p++){
                        this.backBuffer.data[k][i][p] = this.backBuffer.data[k][i][this.backBuffer.pad]
                        this.backBuffer.data[k][i][this.backBuffer.data[k][i].length - 1 - p] = this.backBuffer.data[k][i][this.backBuffer.data[k][i].length - 1 - this.backBuffer.pad]
                    }
                }
            }
            
            this.swapBuffer()
        }

        this.applyMask = function(mask,n_itr=1){

            pad = Math.floor(mask.length/2)
            dif = pad - this.frontBuffer.pad
            this.applyPadding(this.frontBuffer, dif )
            
            for(k = 2 ; k >= 0 ; k--){
                if(this.frontBuffer.isGrayScale){
                    k = 0 
                    this.backBuffer.isGrayScale = true
                }
                for(n = 0 ; n < n_itr ; n++ ){
                    for(i = this.backBuffer.pad; i < this.backBuffer.height + this.backBuffer.pad; i++){
                        for (j = this.backBuffer.pad ; j < this.backBuffer.width + this.backBuffer.pad; j++){
                            sum = 0
                            for(a = 0 ; a < mask.length ; a++){
                                for(b = 0; b < mask.length ; b++){
                                    sum += this.frontBuffer.data[k][i+a-pad][j+b-pad] * mask[a][b]
                                }
                            }
                            this.backBuffer.data[k][i][j] = sum
                        }
    
                        for(p = 0 ; p < this.backBuffer.pad ; p++){
                            this.backBuffer.data[k][i][p] = this.backBuffer.data[k][i][this.backBuffer.pad]
                            this.backBuffer.data[k][i][this.backBuffer.data[k][i].length - 1 - p] = this.backBuffer.data[k][i][this.backBuffer.data[k][i].length - 1 - this.backBuffer.pad]
                        }
                    }
                }
                
            }
            this.removePadding(this.frontBuffer, dif)
            
            this.swapBuffer()
        }

        this.histEqualization = function(){
            for(k = 2 ; k >= 0 ; k--){
                if(this.frontBuffer.isGrayScale){
                    k = 0
                }

                hist = new Array(256).fill(0)

                for(i = this.frontBuffer.pad ; i < (this.frontBuffer.height + this.frontBuffer.pad); i++){
                    for(j = this.frontBuffer.pad ; j < (this.frontBuffer.width + this.frontBuffer.pad); j++){
                        hist[this.frontBuffer.data[k][i][j]] += 1
                    }
                }

                s = new Array(256).fill(0)

                sum = 0
                for(i = 0 ; i < 256; i++){
                    sum += hist[i]

                    s[i] = Math.round(255 * sum / (this.frontBuffer.height * this.frontBuffer.width))
                }

                //console.log(hist,s)
                for(i = this.frontBuffer.pad ; i < (this.frontBuffer.height + this.frontBuffer.pad); i++){
                    for(j = this.frontBuffer.pad ; j < (this.frontBuffer.width + this.frontBuffer.pad); j++){
                        this.frontBuffer.data[k][i][j] = s[this.frontBuffer.data[k][i][j]]
                    }
                }
            }

            this.reloadBuffer()

            return {'hist' : hist, 's' : s, size : this.frontBuffer.width * this.frontBuffer.height}
        }
  
        this.ctx.clearRect(0,0,this.width,this.height)
        this.ctx.drawImage(img,this.x1,this.y1, this.sw, this.sh)
        
        this.frontBuffer = this.imageToData(this.ctx.getImageData(this.x1,this.y1, this.sw, this.sh))
        this.backBuffer = this.imageToData(this.ctx.getImageData(this.x1,this.y1, this.sw, this.sh))


        this.applyPadding(this.frontBuffer,1)
        this.applyPadding(this.backBuffer,1)
    },


}
