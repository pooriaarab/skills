---
name: org-iphone-storage
description: "Use when an iPhone is almost full and apps stop working. Measures free space, app sizes and the camera roll from a Mac over USB, confirms the Google Photos backup, and lists the safe ways to free space. The owner does every deletion on the phone. Triggers: 'my iPhone storage is full', 'free up space on my phone', 'are my photos in Google Photos'."
---

# iPhone storage

Free space on a full iPhone without losing anything. A Mac measures
over a USB cable. Google Photos holds the backup. The owner does every deletion on
the phone, after the backup is verified.

**Stop point:** this skill never deletes from the phone. AFC (the file
service it uses) can delete files. Do not send `rm` to `afcclient`, ever.

## Requirements

- A Mac, the iPhone on a USB cable, and the phone unlocked with "Trust This
  Computer" accepted.
- `brew install libimobiledevice ideviceinstaller`. This gives `ideviceinfo`,
  `ideviceinstaller` and `afcclient`.
- The Google Photos app on the phone, signed in, with backup on.

Wi-Fi pairing is not enough. `xcrun devicectl` sees a phone over Wi-Fi, but
it cannot read free space or app sizes. `ideviceinfo` finds only a phone on
USB.

## 1. Measure

### Free space

```sh
U=$(idevice_id -l | head -1)
ideviceinfo -u "$U" -q com.apple.disk_usage | grep -E 'TotalDataCapacity|AmountDataAvailable'
```

`AmountDataAvailable` is the real free space. Ignore `TotalDataAvailable`:
it counts purgeable space and reads far too high on a full phone.

### App sizes

```sh
ideviceinstaller -u "$U" list --user --xml \
  -a CFBundleDisplayName -a StaticDiskUsage -a DynamicDiskUsage > apps.plist
```

**These numbers are a floor, not the total.** `DynamicDiskUsage` leaves out
data that an app keeps in App Group containers. On one phone it reported 45.5
GB of apps while Settings reported 112.21 GB: Telegram (17.53 GB), WhatsApp
(16.43 GB) and CapCut (12.75 GB) were missing from the top of the list. Read
the real sizes from Settings, as in "What the Mac cannot see" below.

Name the size attributes with `-a`. Without them, every app reports zero
bytes. Send stderr to `/dev/null`, or parse from the first `<?xml`.
`StaticDiskUsage` is the app binary and `DynamicDiskUsage` is its data. Sort by
the sum.

### Camera roll

`afcclient` reads `/DCIM` and the other media folders. It is an interactive
shell, so pipe commands into it and strip its color codes:

```sh
printf 'ls -l /DCIM/100APPLE\nquit\n' | afcclient -u "$U" | sed 's/\x1b\[[0-9;]*m//g'
```

A `ls -l` line is `-rw-r--r-- 1 mobile mobile <bytes> <day> <mon> <year>
<time> <name>`. Put many `ls -l` commands into one `afcclient` session, with an
`echo` marker between them. One session lists about 5,000 files in 10 seconds.
Collect every file in every `/DCIM/*APPLE` folder, then group
by extension, by year, and list the 20 largest. Videos (`.MOV`) are almost
always most of the size, and a few long videos are most of that.

Do not walk `/PhotoData`. It holds tens of thousands of small folders of
thumbnails and caches. One `afcclient` call per folder takes hours, and the
content rebuilds itself.

### What the Mac cannot see

App Group data, Messages attachments, and "System Data" are not reachable over
AFC. **Settings > General > iPhone Storage** is the source of truth for every
app and category size. Read it one of two ways.

With WebDriverAgent running (see
[`ios-device-control`](../ios-device-control/SKILL.md)), read the page as text.
Each app row is a button labelled `<name>, Last used: <date>, <size>`:

```sh
iphone-wda open com.apple.Preferences
iphone-wda find General && iphone-wda tap "iPhone Storage"
iphone-wda tree    # wait a few seconds first; the page computes sizes
```

Drag down the page and read the tree again to collect every app row.

Without WebDriverAgent, capture the screen if Developer Mode is on. Ask the
owner to unlock the phone and open that page, then run:

```sh
xcrun devicectl device capture screenshot --device "$U" --destination storage.png
```

A locked or dark screen gives an all-black image. `idevicescreenshot` fails on
current iOS, because it needs a developer disk image that it cannot mount.
Without Developer Mode, ask the owner for a screenshot.

## 2. Confirm the cloud backup on the phone

Do not copy the camera roll to the Mac. It needs as much Mac space as the
phone uses, and the owner wants the cloud to hold the copy.

The Mac cannot prove what Google Photos holds. Since March 2025 the Google
Photos Library API reads only items that the calling app uploaded, so it
cannot list the owner's library. The check happens in the app:

1. Open Google Photos and tap the profile picture. The status must read
   **Backup complete**. "Backing up N items" or "Waiting for Wi-Fi" means not
   done yet.
2. Open **Settings > Backup > Backup quality**. **Original quality** keeps
   the full file. **Storage saver** keeps a smaller copy, so the phone holds
   the only original.
3. Check that Google storage has room: one.google.com/storage.

Keep the app open on Wi-Fi and power until the status reads Backup complete.
iOS pauses the upload when the app is in the background.

## 3. Remove the local copies of backed-up items

In Google Photos, open **Settings > Backup > Free up space**. It removes from
the phone only the items that are already backed up, and it shows the number
of items and bytes first.

Those items then go to **Photos > Albums > Recently Deleted**. Space comes
back only after the owner empties that album.

## 4. Free space on the phone

Give the owner this list, with the numbers from step 1. Do each step on the
phone. The owner decides each one.

1. **Free up space** in Google Photos, as in step 3.
2. **Offload unused apps:** Settings > Apps > App Store > Offload Unused Apps.
   Offloading keeps the app's data.
3. **Message retention:** Settings > Apps > Messages > Keep Messages > 1 Year.
   Review large attachments in Settings > General > iPhone Storage > Messages.
4. **Chat app media:** in a big chat app, use the app's own storage screen,
   such as Telegram > Settings > Data and Storage > Storage Usage, or
   WhatsApp > Settings > Storage and Data > Manage Storage. Telegram can clear
   its cache and download it again from its servers.
5. **App caches:** offload and reinstall the largest data users from the app
   list. Check first that the app keeps its data on a server.

**Caution:** check Settings > [your name] > iCloud > Photos before step 3.
If iCloud Photos is on, a deletion on the phone also deletes the photo from
iCloud. The Google Photos copy is then the only copy.

## Verify

- `AmountDataAvailable` before and after the cleanup.
- The Google Photos status reads Backup complete, at Original quality.
- The item count that Free up space reported.

## Related skills

- [`org-icloud-photos`](../org-icloud-photos/SKILL.md) organizes the Photos
  library itself.
- [`org-google-photos`](../org-google-photos/SKILL.md) organizes Google Photos.
