// Person matte for a video: writes one grayscale PNG mask per frame (macOS Vision).
// Build: swiftc -O personmask.swift -o personmask
// Usage: ./personmask <in.mp4> <outdir>   (about 60 s for 600 frames of 1080 x 1080 on an M3 Pro)
// Then merge the masks into a VP9 WebM with alpha; see references/edit-effects.md.
import AVFoundation
import Vision
import CoreImage
import ImageIO
import UniformTypeIdentifiers

let args = CommandLine.arguments
let asset = AVURLAsset(url: URL(fileURLWithPath: args[1]))
let outDir = URL(fileURLWithPath: args[2])
try? FileManager.default.createDirectory(at: outDir, withIntermediateDirectories: true)
let track = asset.tracks(withMediaType: .video)[0]
let reader = try! AVAssetReader(asset: asset)
let out = AVAssetReaderTrackOutput(track: track, outputSettings: [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA])
reader.add(out)
reader.startReading()
let ctx = CIContext()
let req = VNGeneratePersonSegmentationRequest()
req.qualityLevel = .accurate
req.outputPixelFormat = kCVPixelFormatType_OneComponent8
var i = 0
while let sb = out.copyNextSampleBuffer() {
  guard let pb = CMSampleBufferGetImageBuffer(sb) else { continue }
  let w = CVPixelBufferGetWidth(pb), h = CVPixelBufferGetHeight(pb)
  try! VNImageRequestHandler(cvPixelBuffer: pb).perform([req])
  let mask = req.results!.first!.pixelBuffer
  var img = CIImage(cvPixelBuffer: mask)
  img = img.transformed(by: CGAffineTransform(scaleX: CGFloat(w) / img.extent.width, y: CGFloat(h) / img.extent.height))
  let cg = ctx.createCGImage(img, from: CGRect(x: 0, y: 0, width: w, height: h), format: .L8, colorSpace: CGColorSpaceCreateDeviceGray())!
  let url = outDir.appendingPathComponent(String(format: "m%05d.png", i))
  let dest = CGImageDestinationCreateWithURL(url as CFURL, UTType.png.identifier as CFString, 1, nil)!
  CGImageDestinationAddImage(dest, cg, nil)
  CGImageDestinationFinalize(dest)
  i += 1
}
print("frames", i)
