# Recipes

Add a step only after the frame shows it. An unverified step is a defect.
This file holds what one phone showed. It is not a guess.

## Shown

1. The frame was 500 by 1080. Status had device, screen, and calibrated true.
2. Dock centers on that frame: Phone (0.17, 0.93), Messages (0.38, 0.94), Safari (0.62, 0.93). A dark T3 icon sits near (0.81, 0.93). The AssistiveTouch button sits above the dock on the right.
3. A tap at (0.64, 0.10) did not open Social. The pointer stopped on the weather widget.
4. From that pointer, raw `move 70 -8` then raw `click` opened the Social folder.
5. Folder page 1, read from the frame: Facebook (0.27, 0.36), Messenger (0.50, 0.36), Instagram (0.74, 0.36), LinkedIn (0.27, 0.48), WhatsApp (0.74, 0.48), Telegram (0.29, 0.59), Quora (0.73, 0.60). TikTok is the dark icon near (0.50, 0.48). X is the dark icon near (0.50, 0.59). More pages exist.
6. A later tap at the Instagram fraction ran after the folder had closed. It opened Calendar. Do not tap a stored fraction until the frame shows the pointer on the icon.
7. `POST /api/home` did not leave Calendar. A slow press and drag from the bottom opened the app switcher. Do not swipe a card up. That closes the app. A tap at (0.18, 0.06), on the dim strip, left the switcher and showed the home screen.
8. A click that is not on the AssistiveTouch button does not open its menu.

9. The grey circle on the Messages dock icon, then a raw click, opened Messages. The title bar read Messages. No thread was opened. See [Messages](messages.md).
10. With the circle on the home indicator, raw `press`, `move 0 -600`, and `release` opened the app switcher again. A click in the dark area above the cards showed the home screen.
11. The grey circle on the Safari compass, then a raw click, opened Safari. The bottom bar showed back, forward, an address, reload, and tabs. No link was followed. See [Safari](safari.md).
12. The same leave path closed the Safari view. The switcher card was labeled Safari. A click in the dark area showed the home screen.
13. The grey circle on the green handset, then a raw click, opened Phone. The title read Calls. No call was placed. See [Phone](phone.md).
14. The dark dock icon is a folder. It showed T3 Code and Muse. T3 Code opened. The title read T3 Code ALPHA. Continue was not tapped. Muse was not opened. See [Dock folder](t3.md).
15. A horizontal drag on empty wallpaper opened the next Home Screen page. The gear opened Settings. No switch was changed. See [Settings](settings.md).
16. The blue envelope on that page opened Mail. The header was blue. No message was opened. See [Mail](mail.md).
17. A drag from the left status bar opened Notification Centre. A drag from the right status icons opened Control Centre. See [Notifications](notifications.md).
18. The grey circle on the Facebook icon, then a raw click, opened Facebook. The header showed the word facebook. No post was made. See [Facebook](facebook.md).
19. The grey circle on the Instagram icon, then a raw click, opened Instagram. The title read Instagram. No story was opened. See [Instagram](instagram.md).
20. The grey circle on the TikTok icon, then a raw click, opened TikTok. The top bar showed For You. A bottom drag scrolled the feed. It did not leave the app. See [TikTok](tiktok.md).

## Not shown

Do not write these until a frame shows them: open X, LinkedIn, Camera, or the Muse app. Do not like, comment, share, publish, send, or call. A verified leave from TikTok is also not shown.

## Next step

Move. Save the frame. Click only when the grey circle is on the target. Save the frame again.
