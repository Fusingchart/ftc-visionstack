"""Render original course illustrations with Pillow. Pass a directory of DejaVu Sans fonts if needed."""
from argparse import ArgumentParser
from math import atan2, cos, sin, pi, radians
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

parser = ArgumentParser(description=__doc__)
parser.add_argument("--fonts", type=Path, default=Path("/usr/share/fonts/truetype/dejavu"))
fonts = parser.parse_args().fonts
output = Path(__file__).resolve().parents[1] / "site/figures"
output.mkdir(exist_ok=True)

BG = "#112436"
INK = "#f0f7fc"
MUTED = "#b4c8d8"
MINT = "#a5f6c6"
BLUE = "#7cd5f3"
GOLD = "#ffc387"
LINE = "#3d586f"
PANEL = "#1a3348"
W, H = 940, 480

def text(xy, value, size=28, color=INK, bold=False, anchor="la"):
    font = ImageFont.truetype(str(fonts / ("DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf")), size)
    draw.text(xy, value, font=font, fill=color, anchor=anchor)

def line(points, color=LINE, width=3):
    draw.line(points, fill=color, width=width)

def dot(point, color, radius=7):
    x, y = point
    draw.ellipse((x-radius,y-radius,x+radius,y+radius), fill=color)

def arrow(p, q, color=BLUE, width=4):
    line([p,q], color, width)
    angle = atan2(q[1]-p[1], q[0]-p[0])
    wing = [(q[0]-15*cos(angle+a),q[1]-15*sin(angle+a)) for a in (-pi/6,pi/6)]
    draw.polygon([q,*wing], fill=color)

def box(bounds, fill=PANEL, outline=LINE, radius=16):
    draw.rounded_rectangle(bounds,radius,fill=fill,outline=outline,width=2)

def start(title):
    global canvas, draw
    canvas=Image.new("RGB",(W,H),BG)
    draw=ImageDraw.Draw(canvas)
    text((36,27),title,32,bold=True)

def save(name):
    canvas.save(output / (name+".webp"),"WEBP",quality=90,method=6)

def tag(x,y,size):
    # Schematic marker art, deliberately not a printable AprilTag.
    draw.rectangle((x,y,x+size,y+size), fill=INK)
    cell=size/7
    draw.rectangle((x+cell,y+cell,x+6*cell,y+6*cell),fill=BG)
    for row,col in [(1,0),(0,1),(2,3),(1,2),(3,2),(3,0),(2,1),(0,3)]:
        xx,yy=x+(1.5+col)*cell,y+(1.5+row)*cell
        draw.rectangle((xx,yy,xx+cell,yy+cell),fill=INK)

start("Vision on the practice field")
for x in range(40,W,76): line([(x,79),(x,449)],width=1)
for y in range(79,450,62): line([(38,y),(904,y)],width=1)
draw.polygon([(328,270),(823,101),(823,431)],fill="#173d50",outline=LINE)
line([(328,270),(804,270)],BLUE,3)
arrow((328,270),(759,177),MINT)
box((83,173,301,374),"#233d54",BLUE,22)
for y in (152,352):
    for x in (103,228): box((x,y,x+62,y+44),BG,LINE,9)
box((113,204,270,343),PANEL,LINE)
draw.arc((139,227,232,318),0,360,fill=LINE,width=4)
arrow((171,273),(258,273),BLUE)
box((285,247,329,293),BG,MINT,8)
tag(770,132,91)
text((809,240),"Target",25,INK,anchor="ma")
text((183,401),"Robot chassis",25,anchor="ma")
text((349,296),"Camera centerline",23,BLUE)
text((445,189),"Measured bearing",23,MINT)
save("field-view")

start("One image becomes one observation")
xs=[34,262,490,718]
labels=[("Capture","Pixels"),("Detect","ID + corners"),("Estimate","Bearing / pose"),("Decide","Motor request")]
for i,(x,(label,sub)) in enumerate(zip(xs,labels)):
    box((x,117,x+185,361))
    text((x+92,142),label,26,bold=True,anchor="ma")
    text((x+92,315),sub,22,MUTED,anchor="ma")
    if i<len(xs)-1: arrow((x+187,230),(xs[i+1]-5,230),MINT)
tag(94,196,66)
for xx,yy in [(322,196),(388,196),(388,262),(322,262)]: dot((xx,yy),MINT,7)
line([(322,196),(388,196),(388,262),(322,262),(322,196)],LINE,3)
arrow((530,262),(623,262),LINE)
arrow((530,262),(625,207),BLUE)
draw.arc((544,219,605,282),330,360,fill=GOLD,width=3)
arrow((773,254),(850,208),MINT)
text((35,403),"Keep frame identity and timing with the observation.",25)
save("pipeline")

start("A bearing is measured from the optical axis")
origin=(130,310); target=(763,128)
line([origin,(860,310)],LINE,4)
arrow(origin,target,BLUE,5)
dot(origin,MINT,9); dot(target,GOLD,10)
line([target,(763,310)],LINE,3)
draw.arc((8,188,252,432),344,360,fill=MINT,width=5)
text((280,254),"Bearing θ",28,MINT)
text((771,104),"Target",26,GOLD)
text((129,345),"Lens center",27)
text((521,334),"Optical axis",27,MUTED)
text((753,221),"Offset",23,MUTED,anchor="ra")
save("bearing")

start("A correct pixel ray can still give a poor range")
lens=(117,338)
for y in (338,211): line([(110,y),(857,y)],LINE,3)
arrow(lens,(564,211),BLUE,4)
arrow(lens,(837,211),GOLD,4)
for point,color in [((564,211),BLUE),((837,211),GOLD),(lens,MINT)]: dot(point,color)
text((558,163),"Steeper ray",25,BLUE,anchor="ma")
text((834,163),"Shallower ray",25,GOLD,anchor="ma")
text((100,373),"Camera",25)
text((440,373),"Horizontal range to target",25,MUTED)
arrow((87,338),(87,211),MINT,3)
text((32,250),"Rise",22,MINT)
save("elevation-range")

start("From AprilTag corners to pose")
tag(92,134,206)
quad=[(471,141),(789,179),(741,355),(526,323),(471,141)]
line(quad,BLUE,5)
for coord in quad[:-1]: dot(coord,MINT,10)
arrow((324,234),(419,234),GOLD)
text((195,367),"Known square",26,anchor="ma")
text((645,381),"Observed image corners",26,anchor="ma")
text((34,431),"Corner geometry + calibrated camera → estimated pose",24,MUTED)
save("tag-corners")

start("A falling error changes the motor request")
zero=640; scale=960
line([(zero,108),(zero,396)],LINE,3)
for y,label,value,color in [(152,"P   Current error",.14,BLUE),(224,"I    Disabled",0,MUTED),(296,"D   Falling error",-.12,GOLD),(368,"Sum",.02,MINT)]:
    text((38,y),label,27)
    edge=zero+value*scale
    if value: line([(zero,y+13),(edge,y+13)],color,20)
    else: dot((zero,y+13),color,6)
    text((888,y),f"{value:+.3f}" if value else "0",24,color,anchor="ra")
text((410,425),"Left turn",23,MUTED)
text((874,425),"Right turn",23,MUTED,anchor="ra")
save("pid-terms")

start("Camera coordinates need the mount transform")
for p,a,color,name in [((123,365),0,MUTED,"Field"),((484,321),-40,BLUE,"Robot"),((609,239),-40,MINT,"Camera")]:
    r=radians(a)
    arrow(p,(p[0]+90*cos(r),p[1]+90*sin(r)),color)
    arrow(p,(p[0]+73*sin(r),p[1]-73*cos(r)),color)
    dot(p,color,6)
    text((p[0],p[1]+18),name,26,color,anchor="ma")
line([(123,365),(484,321),(609,239),(789,124)],LINE,4)
tag(769,85,76)
text((833,178),"Tag",25,anchor="ma")
text((27,426),"Map camera → robot → field, carrying units and axis directions.",23)
save("frames")

start("Correct at capture, then replay motion")
line([(139,160),(808,160)],LINE,3)
for px,label in [(166,"Capture"),(773,"Now")]:
    dot((px,160),BLUE)
    text((px,111),label,27,anchor="ma")
for px,top,bottom in [(166,"Predicted 1.00 m","Corrected 1.12 m"),(773,"Predicted 1.20 m","Corrected 1.32 m")]:
    text((px,198),top,25,anchor="ma")
    arrow((px,245),(px,301),MINT)
    text((px,329),bottom,25,MINT,anchor="ma")
arrow((314,338),(624,338),MINT)
text((469,297),"Replay +0.20 m",24,anchor="ma")
text((35,418),"Camera observation at capture: 1.15 m",26,GOLD)
save("pose-replay")

start("The age of a frame follows it into the controller")
line([(105,258),(823,258)],LINE,4)
for x,label,color,y in [(105,"Exposure",MINT,194),(380,"Result ready",BLUE,294),(632,"Hub reads",BLUE,194),(823,"Command",GOLD,294)]:
    dot((x,258),color,9)
    text((x,y),label,24,color,anchor="ma")
arrow((105,135),(823,135),MINT)
text((462,89),"Capture to command",26,MINT,anchor="ma")
text((40,412),"Illustrative event order. Spacing is not a timing measurement.",22,MUTED)
save("latency")

start("HSV mask before contour selection")
for x,title in [(45,"Input image"),(505,"Threshold mask")]:
    text((x,111),title,25,bold=True)
    box((x,155,x+390,362),PANEL)
draw.ellipse((89,203,224,338),fill="#ffcb3d")
draw.ellipse((548,203,683,338),fill=INK)
draw.rectangle((261,205,402,235),fill="#6d92a7")
draw.ellipse((323,275,377,329),fill="#bce7ff")
arrow((443,260),(494,260),MINT,3)
text((45,415),"Pass yellow pixels, then describe the connected region.",25)
save("hsv-mask")
