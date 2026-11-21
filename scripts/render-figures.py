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

W, H = 940, 480

# The transparent canvas takes on the documentation page's own background.
PALETTES = {
    "light": ("#203246", "#455a6b", "#076553", "#285b81", "#8b521c", "#8499a9", "#ebf1f4", "#e3efe9", "#dce7eb"),
    "dark": ("#ebf2f7", "#b3c4d2", "#8ee0bc", "#9ecbe9", "#f0bb84", "#708698", "#203241", "#1a3a37", "#283e50"),
}

def text(xy, value, size=28, color=None, bold=False, anchor="la"):
    font = ImageFont.truetype(str(fonts / ("DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf")), size)
    draw.text(xy, value, font=font, fill=color or INK, anchor=anchor)

def line(points, color=None, width=3):
    draw.line(points, fill=color or LINE, width=width)

def dot(point, color, radius=7):
    x, y = point
    draw.ellipse((x-radius,y-radius,x+radius,y+radius), fill=color)

def arrow(p, q, color=None, width=4):
    color = color or BLUE
    line([p,q], color, width)
    angle = atan2(q[1]-p[1], q[0]-p[0])
    wing = [(q[0]-15*cos(angle+a),q[1]-15*sin(angle+a)) for a in (-pi/6,pi/6)]
    draw.polygon([q,*wing], fill=color)

def box(bounds, fill=None, outline=None, radius=5):
    draw.rounded_rectangle(bounds, radius, fill=fill or PANEL, outline=outline or LINE, width=2)

def start():
    global canvas, draw
    canvas=Image.new("RGBA", (W,H))
    draw=ImageDraw.Draw(canvas)

def save(name):
    canvas.crop((0, 65, W, 465)).save(output / (name + suffix + ".webp"), "WEBP", lossless=True, method=6)

def tag(x,y,size):
    # Schematic marker art, deliberately not a printable AprilTag.
    draw.rectangle((x,y,x+size,y+size), fill="#f7f8f7")
    cell=size/7
    draw.rectangle((x+cell,y+cell,x+6*cell,y+6*cell),fill="#203246")
    for row,col in [(1,0),(0,1),(2,3),(1,2),(3,2),(3,0),(2,1),(0,3)]:
        xx,yy=x+(1.5+col)*cell,y+(1.5+row)*cell
        draw.rectangle((xx,yy,xx+cell,yy+cell),fill="#f7f8f7")

for theme, palette in PALETTES.items():
    INK, MUTED, MINT, BLUE, GOLD, LINE, PANEL, FIELD, CHASSIS = palette
    suffix = "-dark" if theme == "dark" else "-light"

    start()
    for x in range(40,901,76): line([(x,85),(x,439)],PANEL,1)
    for y in range(85,441,62): line([(38,y),(904,y)],PANEL,1)
    draw.polygon([(328,270),(823,101),(823,431)],fill=FIELD,outline=LINE)
    line([(328,270),(804,270)],BLUE,3)
    arrow((328,270),(759,177),MINT)
    box((83,173,301,374),CHASSIS,BLUE,12)
    for y in (152,352):
        for x in (103,228): box((x,y,x+62,y+44),PANEL,LINE,4)
    box((113,204,270,343),PANEL,LINE)
    draw.arc((139,227,232,318),0,360,fill=LINE,width=4)
    arrow((171,273),(258,273),BLUE)
    box((285,247,329,293),CHASSIS,MINT,4)
    tag(770,132,91)
    text((809,240),"Target",25,INK,anchor="ma")
    text((183,401),"Robot chassis",25,anchor="ma")
    text((349,296),"Camera centerline",23,BLUE)
    text((455,163),"Measured bearing",23,MINT)
    save("field-view")

    start()
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
    save("pipeline")

    start()
    origin=(130,310); target=(763,128)
    line([origin,(860,310)],LINE,4)
    arrow(origin,target,BLUE,5)
    dot(origin,MINT,9); dot(target,GOLD,10)
    line([target,(763,310)],LINE,3)
    draw.arc((8,188,252,432),344,360,fill=MINT,width=5)
    text((280,266),"Bearing θ",28,MINT)
    text((771,104),"Target",26,GOLD)
    text((129,345),"Lens center",27)
    text((521,334),"Optical axis",27,MUTED)
    text((753,221),"Offset",23,MUTED,anchor="ra")
    save("bearing")

    start()
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

    start()
    tag(92,134,206)
    quad=[(471,141),(789,179),(741,355),(526,323),(471,141)]
    line(quad,BLUE,5)
    for coord in quad[:-1]: dot(coord,MINT,10)
    arrow((324,234),(419,234),GOLD)
    text((195,367),"Known square",26,anchor="ma")
    text((645,381),"Observed image corners",26,anchor="ma")
    save("tag-corners")

    start()
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

    start()
    for p,a,color,name in [((123,365),0,MUTED,"Field"),((484,321),-40,BLUE,"Robot"),((609,239),-40,MINT,"Camera")]:
        r=radians(a)
        arrow(p,(p[0]+90*cos(r),p[1]+90*sin(r)),color)
        arrow(p,(p[0]+73*sin(r),p[1]-73*cos(r)),color)
        dot(p,color,6)
        text((p[0],p[1]+18),name,26,color,anchor="ma")
    line([(123,365),(484,321),(609,239),(789,124)],LINE,4)
    tag(769,85,76)
    text((833,178),"Tag",25,anchor="ma")
    save("frames")

    start()
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

    start()
    line([(105,258),(823,258)],LINE,4)
    for x,label,color,y in [(105,"Exposure",MINT,194),(380,"Result ready",BLUE,294),(632,"Hub reads",BLUE,194),(823,"Command",GOLD,294)]:
        dot((x,258),color,9)
        text((x,y),label,24,color,anchor="ma")
    arrow((105,135),(823,135),MINT)
    text((462,89),"Capture to command",26,MINT,anchor="ma")
    save("latency")

    start()
    for x,title in [(45,"Input image"),(505,"Threshold mask")]:
        text((x,111),title,25,bold=True)
        box((x,155,x+390,362),PANEL if x == 45 else "#26313b")
    draw.ellipse((89,203,224,338),fill="#ffcb3d")
    draw.ellipse((548,203,683,338),fill="#f7f8f7")
    draw.rectangle((261,205,402,235),fill="#6d92a7")
    draw.ellipse((323,275,377,329),fill="#bce7ff")
    arrow((443,260),(494,260),MINT,3)
    save("hsv-mask")

    start()
    for center, label, spread in [(250,"Top view · horizontal",112),(704,"Side view · vertical",77)]:
        lens = (center-148,262)
        top = (center+152,262-spread)
        bottom = (center+152,262+spread)
        text((center,99),label,27,anchor="ma")
        draw.polygon([lens,top,bottom],fill=FIELD,outline=MINT,width=3)
        line([lens,(center+152,262)],BLUE,3)
        dot(lens,BLUE)
        arc = atan2(spread,300)*180/pi
        x, y = lens
        draw.arc((x-100,y-100,x+100,y+100),-arc,arc,fill=GOLD,width=5)
        text((x+117,y+12),"FOV",26,GOLD)
    line([(474,105),(474,414)],width=2)
    save("camera-fov")

    start()
    lens, center, edge = (119,339), (755,339), (755,137)
    line([lens,center,edge,lens],BLUE,4)
    dot(lens,MINT,8)
    dot(edge,GOLD,8)
    line([(735,339),(735,319),(755,319)],LINE,2)
    arc=atan2(center[1]-edge[1],center[0]-lens[0])*180/pi
    draw.arc((lens[0]-142,lens[1]-142,lens[0]+142,lens[1]+142),-arc,0,fill=GOLD,width=4)
    text((270,299),"θ / 2",31,GOLD)
    text((446,358),"Focal length fₓ (px)",27,anchor="ma")
    text((783,225),"W / 2",28)
    text((129,272),"Lens",25)
    text((756,97),"Image edge",25,anchor="ma")
    save("camera-focal-triangle")

    start()
    left,top,right,bottom=191,106,754,410
    middle=((left+right)/2,(top+bottom)/2)
    box((left,top,right,bottom),PANEL,LINE,2)
    line([(left,middle[1]),(right,middle[1])],LINE,2)
    line([(middle[0],top),(middle[0],bottom)],LINE,2)
    dot(middle,BLUE,8)
    target=(left+(right-left)*400/640,middle[1])
    dot(target,MINT,9)
    arrow((left,top),(left+95,top),BLUE)
    arrow((left,top),(left,top+77),BLUE)
    text((left+112,top-25),"u (right)",26,BLUE)
    text((left-119,top+91),"v (down)",24,BLUE)
    line([middle,(middle[0],middle[1]+69),(target[0],middle[1]+69),target],MINT,2)
    text((middle[0]-20,middle[1]+99),"(320, 240)",25,BLUE,anchor="ma")
    text((target[0]+18,target[1]-60),"(400, 240)",25,MINT)
    text((target[0]+26,target[1]+55),"+80 px",23,MINT)
    save("camera-image-plane")

    start()
    for x,label,sub in [(45,"Controller","Error → effort"),(360,"Chassis","Effort → turn"),(675,"Camera","Angle → sample")]:
        box((x,124,x+220,258))
        text((x+110,143),label,30,bold=True,anchor="ma")
        text((x+110,207),sub,24,MUTED,anchor="ma")
    for x in [266,581]: arrow((x,186),(x+90,186),BLUE)
    line([(783,262),(783,368),(154,368)],LINE,4)
    arrow((154,368),(154,262),MINT)
    text((469,385),"Delayed angle measurement",28,MINT,anchor="ma")
    save("pid-loop")

    start()
    for x,title,active in [(110,"Edge contact",((0,0),(1,0))),(560,"Corner contact",((0,0),(1,1)))]:
        text((x,97),title,28,bold=True)
        for col in range(2):
            for row in range(2):
                xx,yy=x+col*103,167+row*103
                box((xx,yy,xx+100,yy+100),MINT if (col,row) in active else PANEL,LINE,2)
        text((x,400),"One region" if x < 500 else "Two regions",25)
    save("mask-connectivity")

    start()
    box((224,166,653,338),FIELD,LINE,2)
    line([(79,252),(869,252)],LINE,4)
    for x, label, color, y in [(439,"Prediction",BLUE,288),(558,"Accepted",MINT,103),(789,"Rejected",GOLD,288)]:
        dot((x,252),color,10)
        text((x,y),label,27,color,anchor="ma")
    text((440,371),"Acceptance band",26,anchor="ma")
    save("innovation-gate")

    start()
    line([(82,264),(858,264)],LINE,4)
    for x,label,color,y in [(148,"Raw camera",BLUE,286),(360,"Partial correction",GOLD,286),(784,"Truth",MINT,286)]:
        dot((x,264),color,10)
        text((x,y),label,28,color,anchor="ma")
    arrow((148,152),(784,152),MINT)
    text((466,95),"0.15 m full correction",28,MINT,anchor="ma")
    arrow((148,383),(360,383),GOLD)
    text((255,395),"0.05 m",24,GOLD,anchor="ma")
    save("latency-distance")

    start()
    line([(66,248),(871,248)],LINE,4)
    for x,name,value,y,color in [(132,"Prediction","1.00 m",279,BLUE),(459,"Equal weights","1.20 m",123,MUTED),(656,"Weighted","1.32 m",279,MINT),(786,"Camera","1.40 m",123,GOLD)]:
        dot((x,248),color,10)
        text((x,y),name,27,color,anchor="ma")
        text((x,y+41),value,24,color,anchor="ma")
    save("fusion-gain")
