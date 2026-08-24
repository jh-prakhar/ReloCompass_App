# Retrofit / OkHttp / Gson keep rules
-keepattributes Signature, InnerClasses, EnclosingMethod, RuntimeVisibleAnnotations, RuntimeVisibleParameterAnnotations, AnnotationDefault
-keepclassmembers,allowshrinking,allowobfuscation interface * {
    @retrofit2.http.* <methods>;
}
-dontwarn okhttp3.internal.platform.**
-dontwarn org.conscrypt.**
-dontwarn org.bouncycastle.**
-dontwarn org.openjsse.**
-dontwarn javax.annotation.**
-dontwarn kotlinx.serialization.**

# Gson DTOs — keep field names so JSON keys survive obfuscation
-keep class com.relocompass.app.api.** { *; }
-keepattributes *Annotation*, InnerClasses
-dontwarn sun.misc.**

# Compose
-keep class androidx.compose.runtime.** { *; }
