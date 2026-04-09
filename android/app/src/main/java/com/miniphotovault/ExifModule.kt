package com.miniphotovault

import android.media.ExifInterface
import com.facebook.react.bridge.*

class ExifModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "ExifModule"

    @ReactMethod
    fun getExifData(imagePath: String, promise: Promise) {
        try {
            val exif = ExifInterface(imagePath)

            val data = Arguments.createMap().apply {
                // GPS
                putString("latitude", exif.getAttribute(ExifInterface.TAG_GPS_LATITUDE) ?: "N/A")
                putString("longitude", exif.getAttribute(ExifInterface.TAG_GPS_LONGITUDE) ?: "N/A")
                putString("gpsLatRef", exif.getAttribute(ExifInterface.TAG_GPS_LATITUDE_REF) ?: "N/A")
                putString("gpsLonRef", exif.getAttribute(ExifInterface.TAG_GPS_LONGITUDE_REF) ?: "N/A")

                // Timestamp
                putString("dateTime", exif.getAttribute(ExifInterface.TAG_DATETIME) ?: "N/A")
                putString("dateTimeOriginal", exif.getAttribute(ExifInterface.TAG_DATETIME_ORIGINAL) ?: "N/A")

                // Device
                putString("make", exif.getAttribute(ExifInterface.TAG_MAKE) ?: "N/A")
                putString("model", exif.getAttribute(ExifInterface.TAG_MODEL) ?: "N/A")

                // Image info
                putString("width", exif.getAttribute(ExifInterface.TAG_IMAGE_WIDTH) ?: "N/A")
                putString("height", exif.getAttribute(ExifInterface.TAG_IMAGE_LENGTH) ?: "N/A")
                putString("orientation", exif.getAttribute(ExifInterface.TAG_ORIENTATION) ?: "N/A")
                putString("flash", exif.getAttribute(ExifInterface.TAG_FLASH) ?: "N/A")

                // Camera settings
                putString("focalLength", exif.getAttribute(ExifInterface.TAG_FOCAL_LENGTH) ?: "N/A")
                putString("exposureTime", exif.getAttribute(ExifInterface.TAG_EXPOSURE_TIME) ?: "N/A")
                putString("iso", exif.getAttribute(ExifInterface.TAG_ISO_SPEED_RATINGS) ?: "N/A")
            }

            promise.resolve(data)
        } catch (e: Exception) {
            promise.reject("EXIF_ERROR", "Failed to read EXIF: ${e.message}")
        }
    }
}