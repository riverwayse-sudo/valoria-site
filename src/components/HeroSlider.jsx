'use client'

import { useEffect, useState } from 'react'
import { BRAND } from '@/lib/brand'
import EventRegistrationModal, { SessionTimer } from './EventRegistrationModal'
import { PROFESSIONAL_STANDARD_SERIES, getSessionState, formatSessionDate } from '@/lib/professionalStandardSeries'

export default function HeroSlider() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [selectedSession, setSelectedSession] = useState(null)

  const upcomingSession = PROFESSIONAL_STANDARD_SERIES.find((session) => getSessionState(session) !== 'ended' && session.id !== '01') || PROFESSIONAL_STANDARD_SERIES[1]
  const upcomingState = getSessionState(upcomingSession)
  const canRegister = upcomingState === 'registration-open'

  useEffect(() => {
    if (paused || selectedSession) return undefined
    const timer = window.setInterval(() => setActive((index) => (index + 1) % 2), 9000)
    return () => window.clearInterval(timer)
  }, [paused, selectedSession])

  const goTo = (index) => setActive(index)
  const openRegistration = () => {
    if (canRegister) setSelectedSession(upcomingSession)
  }

  return (
    <section className="hero hero-slider hero-fashion-editorial" id="hero" aria-label="Valoria Institute introduction">
      <div className="hero-bg" aria-hidden="true" />
      <div className="hero-grid" aria-hidden="true" />

      <div className="hero-slides" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div className={`hero-slide ${active === 0 ? 'is-active' : ''}`} aria-hidden={active !== 0}>
          <div className="container hero-inner">
            <div className="hero-editorial-copy">
              <div className="hero-eyebrow au d1"><div className="hero-eyebrow-line" /><span className="hero-eyebrow-text">THE INSTITUTION FOR PROFESSIONAL MERIT</span></div>
              <p className="hero-editorial-issue">WORTH. BUILT. <span>— THE VALORIA STANDARD</span></p>
              <h1 className="hero-title au d2">Talent is not the problem.<br /><em>Infrastructure is.</em></h1>
              <p className="hero-sub au d3">Valoria builds the systems that develop African professionals, make merit visible and connect proven capability to meaningful opportunity.</p>
              <div className="hero-actions au d4">
                <a href={BRAND.assessmentUrl} className="btn-gold">START THE VALU TASTER <span aria-hidden="true">→</span></a>
                <a href="/about-us" className="btn-outline">THE INSTITUTION</a>
              </div>
              <p className="hero-editorial-footnote">DEVELOPMENT · VISIBILITY · CONNECTION</p>
            </div>

            <div className="hero-editorial-visual au d3">
              <img
                className="hero-editorial-image"
                src="data:image/webp;base64,UklGRmYbAABXRUJQVlA4IFobAAAQvACdASpoAfMBPqFQokymJKqrI/PJ4WAU
CWVu4XIf3nA1XqXXh7H5//WLuLMl4V/BeVk9p6c/1nvm/OF5t/p9/xe/X+jX
01drBXoWRdwgPUALLOZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZm
ZmZmZmZgi3aPgwDw57u7u7u7u7u7fxe6xBJGdlRMtJikiJlOQDJ107fEsXgg
snu7u7u7u7u64vhgXHQEuV8wwbtjg4pF6NByCWfxQ2yOMzhUaSaignb/////
///+/x3e6t1Y18ZvWR4vgxlrHURMBBch4cqFPe7CC+xJnrrfrTQZmZmZmZmZ
mZmZMPVcct8wjBZeBywJ8ypqeTbGhRHntN7k5ETip5AXKl5l6Js0YtYroxHA
yqqqqqqqqjlbJDVosABC+jfsKAazHge9Wd+rwIDedexK2pqnJqXoisXV7tQo
t6weMzMzMzMzMwiikz4SB13hZAdqG2ieCoN2iqV28T5k6pgsNk8hl2TwYfGq
RJ6Tn++1KptZm6kblVVVVVVWuSWWgRg0Cqg2K51ams9MuMqqkgV2xnSLHItL
NfozMzMzMzKPDnQ3t/1ot8NhBruAXjSqzDNJSFJ+OmuZNJU8HZ9W8fol9ICx
DG6FEzMzMysJguwcG/gHzumM89dJik7EuJ53ljhkRrxVfWTCMyITr6SYhMXa
YEvCQ6PB0eQ+cTD6Lu7eCnBv//90mrxUxcApC1PgkkZsF1YjKI6zJI+H4fJ4
9KQNue6ATwupMcjNntRQpbKSrV6pMte0xLFqjRaTM1PNfN1LBcu4FfjL7XCs
pDDzloyjf6LC1fpuWrbeL44NcTj8GSia7MjLxSrhnrSDkb689HkwMRBagTo9
hYq/aqvRbZMIU7bwJi2e5LjUPosFgCTLySMP1B4vgAgpu7MowFyxJRo2jLwj
fqSfn302cBA1MlQt4DoEMzcxDV9s8VlFs4sl01HPX6lVf9tnkgvuxJ1Ba9Wb
6xHLx5sFrAMJDuhZITWrJfVU33RNcsFPG8InGzDIzCTiryoM555uteosk01j
bvvFUrF98JRu5L/4LzQqEds8K/o6K+yIjW8/fS/x35LiEoj7nEnQVUgDp1Eg
5DTKthdu0GaDkm9tMZEoOtU8rbFisvdM1ck0ZE/JaJbskxbZIVUTi6nvHKO6
2agnAOAN9m2uyPdxPSs3piMdycpkPPYVK4VivO98V9BYeXQJFZQ0Hz0JKzcn
pmEpR0lVPXGic5tAWhWic91v8/F3IPsi0nE82G+ZdQmZOCmA5Zxvp1ky+tCT
iMHs1dLUi8dZ3aeRbnhEZUwTK4aGHgtDPCRD0Xx6nBixdb/YDABB/kgFJVQ9
6ZKaNAXdUT0CEskVDE+eMjF40KmL8pAYBRUwMlOTXFBNtNhffW1wCjmTJwfZ
divmndNkomcl+5zwYgT3tNT6c0V3K68vAw5FIMcsWScgruf+ZL/VFlgF2vBp
66zRJPbYefj1/8fi8qpVtGohyBHWg3ujcDYWyF6PvK3yWgmnjQW3NVjfP+Hn
aJNeXzuNUjQUT0+9hZl/9eS5NaNles2vlgtl5e5cLiL3+G3RoUc4pVbnPnzv
IHeqppgO4pdMirwe7LpCJSUY2fzjMx5dCVfOW9cKDhNKjssgcSCjiYv//W4J
VQ/XjreV/+SIwqV/3b21xbl9+RFxT4wQg/nXI+Znns7wJBRhQgx+10EZKSr8
5mZkucrMD8TV2zy+VymkCBqzwKTv1uBM04lf2bR9pPcXXmS0P93qCgeRZwg5
I7AnqGbMzMzlTrlLQXoNgAa36S8pFwq62mwbLUzMzL8Bi2I009kDf7an1/Kx
Q/nWw+mW4rZd3d3Yies7O7I9hyxzJvg4SfQXOKoGBe6ymdJa3HU1u7u7sTiM
Saketa62nWC5T/dPsU0l0N2IsceItSs2zQIWSe7u7D78WD6v6zsjbTg2zRmd
PrPJzPupqUZxOm8acGtlesokiHLskzQHMREQ6MwMbthL7KwJ8/aBZtzLcWTI
xkR+5kpAAP78/wAAAAAAAAAAAAAKTiOiHHGGSyYukW2fIpI8bZTCRSyTLAAA
BWJiRs48MJAQ1sNlhMYUY6uOZBK6zi9Dk9/U6RQhFMZVAgo38HWVp5If2p1b
hc/C/d+DKQ3o5dq+BukD4AboQABqAxUEXK9DwAVr9LauaDJ9Jpf26waBrzZc
QZLb2kNHRKm5Fg2fCRohZFUiCdOaCnKwNoAABjXu68dFcDf3Cn7tF9Et65UJ
vTJp8ECyS1V7UqghWUqfy4y4HATCaMMxCFtLHYymMP4dkKM/gxlDKIfENhR/
yQ5TzuB1CUNVNooPwOrM9k+dVaA3Jkyzkc+tro96FTi/Sh5FYnIInqNoBaPJ
f+7RJN3E75OZB2wixa4ABL+kgxRtsa4qyAoHMCA6Hb1veBX3HEmKC3V2e+KA
OVyl7DKcQPTHIKOIQcOW/1U4MeKnDfomSkEv486iszJmF1RZ/pLDYR2yQ0yD
Zq62SV9t3Fsiathh8D9rhK6/hsV9iC3tlDTciW4WmbMyC9t5X63jKT4o66rs
j4bSUSy9E7FeBVgRkzTFRI8/9Np5hAmlA+ecS9qELhLX1Tsbl0UHsPi22Pv1
BmEGBiHezKP8DCzudtQvCfLD7DE25cJjj4YWkp7JF1MyroeUIX16x2LaglEL
IgH/skHgnJvNIaobyZzgt1YouEdfzXmqx0JzH9i/m6SrxyjkZX1fc16gbygR
gAA12LEWrEs9a6dUsngrnqoWhplY+BwNYa7IxIO9Iuwo8sSBi4IPcYgnAOiX
2BY3saXBAmLMl8sszHR0ZslZ/iW5AWgqZds8SSXztRgTeCYrU+VDfJcAYpkR
9mm78qV2rkJ717VhnlJwseYP9XiWe/99V5gUnVet6UbvWIVcQc01gr0sbIZe
QlYwOLWd3l91kAJFhxzao0JwdjD5MdHKG3kk8OdYkW6EeJnfkGypKc6/PPVU
L6qgX7nHDPUGH10ip2RFhAuklx/75n9XEpjUNslLaWWX42aHusZmL3J3A7fN
aRUbzpxyMXfKMSep0+Hmut8z/xhNsMXK1F8vS67yrGLT+iZCrBMEWFTgVCJ3
Cm7EnxGpNT1nPXdGNh8018HJcFaCwyUXysCVt32CHRqUvMGH2TgAAqrX9e+k
YXHRsU8nWt4Ejh1tj6gxSgske1rJ8uWQ3LlFF0UEmIw+ex8nlrYeRpEESzZo
7Hs0b7nYO3wPAPR2uVRLhVyWSTTPzjOuSp1+c2fbe877b4G4FkAhYMgOoMqq
LkH0qrVO2DGAplhKAeZ3V18xhzaR5WLSheuRrOkzU9H0PJiYo5HKjyTxv6mZ
o3SokFeNxH9QsQILikdAAAHbtW55sRV8MaAwEjrinMs/mcZW0E/KV4os7z12
qxnUj07ixAbTxQt/a2Rm6kNciCWRLkULTGRQ9n7SKv0RdVbeJMkJrzjWEEOp
TbiYWPIeuYChm5D1f165FMiFZ7LueS/XGln4Xvx9g6qxKM0NAAADnq6/HjxG
Yxifs7O+9mrCiKw65u/oUXbPWULjnEycJmfSz/IrSeq21L82nR0O+4VZDzkh
ch4ZZWQZMkhhXefV+55gmTc48CFqfJQ8Qyc1ZNBJ1ExlW+xyQ5vllneX1G0F
4Phj5rbak9gMfburlk6FpDgdR6+cQBg9fy+qO4sOCmQQ4crvaS//pYNA3i9b
3JdCoJapi3jh2ioYCY3HB/EOlEmCMEF8YnN5VKn4dy6dUuf/F2ZVyB7AaSar
9WOiDrBZzHHyBd+e3gWFY1/0Ew58i7jeDjXkXjWcq0V+2ARWn1j6Jye1Pke8
zOv5J+hebYx9ktcycwl2hrBiDKWnCSAdkkeGO+9oIj4NSAAyXqVh8yxwcNKC
94NcdNjEk1X0T7GIq9CKFSC6rD6G66u/q+LXw/nPe5hoPwaJ2E8MSd8AEsSo
K11kPPTGR6rSajcQvX3dM47MMoWHKn14AVohYAF/pC87Vrlldc73km9eoFMt
hAEwZgSp/W67+Y5535zE6HvU2MQ/ldl84s/1CJPtJNXj53CFsCAsU3gL+gm9
WXvtuLL77b4JR4OEqrpcMGbX6/CQp2lqgmLSSdxhm0f+qJWmlD0kwZVkmIbH
pjGp2qsCKWURNb/eZEWF3y/SwB0mEhoqA2Tyhf6EXtZa4NQGOX6xeTKZKwFA
FBsQgTroZQPGEvR6aPpmdcaVFATA7G7lY+2pO32Ar6GWVC1oBUberxEXltQX
dC5n4TuDMgcz99jIHpMcE7YMehoydKhrhF9b7W32pLDDfzn1pWx0/LNYlbVw
AnxCaywWHn+pP3xBkHMmLxqN0J98FkmfQIlKF+3ZpIhSknhmfye5A5ih7Rlm
2ebBMDhtZtZqMKcRGPQoVKmrXwwnzdkJE+MZVrkpTUKCNZTF3hiTDavQaDxf
5A+CcmqmlLBDYEO+eZydCucaSnqA07KmSaZAI7eXK+VT+t35tKpl89xGRhGQ
e4zfe1tpNf0Og0lFCLHPBv54ghCgOCAITRNsXVZCxBsOVrXGHYiXKhTTiWsP
tGmt9iZW/x9Yl7puBJy+DntxBwVURjSDNOFG+qYZ0nYsHkDaELOsbGx05pyf
uHnwy2Ha/RpfGpxNND5XxQO2QmrMhppIF6o2zSEnrYg7WA3JAhswewS75i83
PT/R/5fED78FCrW7Mmc1pdHAGhTy361oLNY/xeH+mLhqOa2eOO2qlTjtVtD7
y/Usnc7Nl07aUgp+nX8hzjO0k3UGmPzHZk+x8ojIDfRsiem3sy5xW/wQ74cz
L+BYP7BO2NGkCVFshKaV/piuGZxSFmLPVeor/fpjcCm7VYcOPecPpsk7EBgX
SrivDkFT8Z7CXEkNdGT4YVJS58cmpnPxXgg+LqxEafrZcqyaojd/2E3FtVtV
P8QISdtlXpUvI66yOi0Luzm9JEhaE+ZZCayUz6/qBvFBjMmqQ0fTRIVFk3SH
bXV8Z22aoAlW8rf6lbey97+dkosxjMP9M25TXqz4Jfudv/der/1154dQwXXN
KkXEa0NM/4CKyVzngrCwNARFJi0p/4R8cRPySJU0/fsck32P9wARf4MWc2b4
j7eqXPTjV/NklSxbGPVWsY7xG8z83YZ/hnIQyrga7M4sIV36tnNLDLL0ymyM
Cod+6uAXVR4uumTulWMEdzpBfRn8CJ3GQD1rnd22xQmPZNZ2qo5C+DtvrmId
GE4ZXqiiVBLAmgrHtBOGiqAIch3pPn8ouolowj2TrfF5PKGCsq6WAGWqU17C
92Zg+QWGHBmQb4CWMrVQE5VVoOCvD6sLRIIoz7HGTliwBF4Mmp4aSGvt8ZaV
lsSk2Gc7VBQEZtjJxbx8tK6MvkQwwmiAbfZh+UER6fVUDUogX4MlP1/5Flo/
w2aA5gROig4f260QZ+HXYULntkGHorKwPsrA98Onlq7sgOpZxMrMvnqyLQIU
39Pclri+aoz+KuUZ/3fPSwxnMd6/c5+0Z0eKZ8prSs9Gib6H1XsXCU1nqjO7
OMDPbHPtntCaNHmoE7tBsZYgsnzNyAg3ook9F5jB4JGr+MvoRVGYDwySlr9A
E75u6Iupfcq8NoK9FBqAABP/bQl/JVyGUAtFCgFeFQnhW2OAZHzXX/FWyaSE
96U9stBgt4sjal0JCgchpRyDA0Cz+/nLbWXQPHrUTXSEft+B+L6emQ9mbOwo
F05Q5Oma18VYaNepS3kG5wY/Y6ifsC0xLJnuvBrFLXoY5yN9xw80KeSVf5QQ
oEr43JyuB4mNwR2i4BvOk5cFgfSPxPi2mQopD9pUeF45drMgJ+Rcw/k+GIUq
9CwC3zfYKhPXE2+gJwN5Xmemiid1O39E9wVaQwyJsgXOc8TKDnRGArbyOp0M
gRjBzESfKUQwI5U7vHXWanBE8LdNl9FPKTlTFzjRoIYDvuPPcGP/HLvQy6vd
Jruu9Qqn8OuUPVILJ7ei9nrOc0rtOwyIBQBMghlAGIOGllZFMSZGWWwwrVZX
ilKHatSLKnY+BJILpZBS33E8Uiy36r2l52k8pzINyYv+xFbbD712/G76op9o
ET8GazvdegD/76L1DleQSB9OsqoNz4Q143WARLRYMZdq5vRRWOHgiXMQPLFG
MvUDE+1I/nOXnH2ZN2aeZ5QJe/sjxf3VZpNsP1rl7QYm5q4Mf9hxxG0LgIjL
/Q6snfkkmDOuSjNr4Yf1BVwjq49Fh9UPqSmrdqipE0az9F38abhY/4VqFaP9
mJCSfuRZozWf5+xlzHPfe67SRZxkk5wG3SQCRbrraibCmRRSLSxhNiOJoLLu
qtMLqkj13K724p4lRIfIxTJX6vbHK+nd9zxhGuTdrQ6wpkiq2PLzpDQAiLhN
TDyqprvyJEzn6SOk479IjoZfEcngslQ+NzGdoD4cmRLWztFZg28WiJFotXfB
oZ844CFBsRG9FhA8D0S1qNXTusDgwGLj3QJe1At0uTz88UnnpU1xfVQSmJQ9
Q2wDSUCVVY614LYeHTtwobEMWs7I2C/4iY6B5o4zAFvl2I0NEPum5bl5ODCY
A8yesaKUpsK+hAtOoZS5etUBSWJDMnp6TFQxpjkG/m41mWCd0IOXBt13kliX
bO6AfsEF/0dFUsCFXA0Am0RcLCwMKYwG1tluPOZtGBurza78/NS7a1Oq4229
1xHWU5dDuokmI1j647tkKvlMO+lB8fatfGSgjBMiQK9HBmgtOw3yY38SX5Fe
FjId9ugkdTLSoRifPEf5rlaRdjZyLxE3JdRAGdMWascBCfJb4yxlkFWAsJr5
BH8aT157HKMw1HqLi4sW1+2BnLj+9jWhWZuyu6j2soS3ExBjUOsuKsj5iFVY
zaF3Rn2xEPe66GXx++ZAvcffZqioCY1QStjUFrcal+lUS+v02frlI6Otirrb
+exNNuOf/VATKdMncQzZxV2zt/CyJq9A+YQ8meblNraICht2ZNTAGi/dkxSM
UTzy5XT5Gl+L3LUT+Zqq8APOolugPwFOvtbRrb+r4h3YUznmrfhwIGqvV+yp
9n/2YiN2Gq4akZ8+7EqVIH0Eg6Evh26RLMPzPmqWiZ6I6Y4j6kc3x1AQEQ/K
jWFWvRiVC+KFQ2DKLh5GtSneSh5QLoGTo18OIif7aJztYU7NtapN/RDtZpcT
lvI6k2+pFhrW2uKg6FDB5y13uwSy4fv/GaVWRSym3XTKbSwtb5DNPQf1T7Aw
i5AsHLFbZ6mFeH+HOkd+IxsyfNLKENjSSdPMjfBK70lscYvANoIg7fsRqdNV
LWtjVu9gQgNsFWgyhRxbBY5lc3Pxl/iIArJmXKu3va+zFmFfIE73ocp7IcMe
RjXGhE6Kj/091GmypP54a8iVqP3NpZfeby4sW3chuamIkOGiRDlfzAu0MdjK
H36dxTcnH22780JsbahCnypS6hdFBBnG44QauQiGp/KeoOesvP5pWgWTwRzx
EJEHCERBkusuiwRxJXpftTnNjxR+UDUfKG+8Uvj5b/ttpkOqSAA/Ss+GX/eB
wlkX3tgSsq5kVhV4tXWlHkpDoDHNusLb98/Is1GHSryGeHy5lNi8twRwL5sA
lJyV+ScNNUbEmu3bvVNKK9E2fsv238Kt7zU2sQKv1A+9O1sCPnyrK+H8eijv
5y3JQz27h2QObnkrqLY2XWDjRy4uHP80OBokjkzgxU5NSiYiXKiEjlktq4ga
9L9/R9MS2NB5eII6gjmvQ6jI42I1+X8DYpt+i/VZuNNLd/x3iGA4LPnwDRgi
3VYZ4QOLtBGXTYYrXF9xFcBiiyQ72N6Qvfbqb38wndRUHOwIENOuukqwEQ2U
ev57UPG/jHjJ35sMZLbOb6P76AX6QB0w5IKzJZBvT2kRHRHamEYN7NOZJRFk
Htd7F+A76uY4XN23NtX2h6DEgWfgG/KfHum0/YYsqBNdG2+moy3pCx3BS6L9
TfI0RlHEAahn+uJnjF5wdtHp9hw0sEnEY6KgB9qjalbwoeaBlbXRP3abAih2
QRpTzgOy+whWaRlqwVH0MAG6bQ3OnDGi8GuMgO8x7Nb6KX66d6ZIfuEAxgrU
LQ7ql6/EVR2B7xOF+fNNpo9cPFnaC9LzYkrcZ1yMdLmpFk2aWtJLh4lpyOR/
lE/a8sK+b1l2r4TRth+Xx/9QyCnsJbP46qJ0sJ4AYm5Hyqzs21IITuteD+o5
mU/vvoopCPqo+kHmgVrRyaNYJMnUI+ojY3/yZkcZVGYnTKcNaYfz6ZUPR6ji
Sj0VIZ5KBIhDcVFyi6g3FehaeJ4uCoBA8FBVEuMfc3HKSB7luVSKm6ik/aq0
UMElPhv6vRFMjvb3T5Xa6KtoLr2MsMF7Wfi+03ITOz42nyHXhygX9q2SrDzl
3Rve6+I74RT1wCcBzSQbcO9mEbz4bOFiXeyt+GuAV8PI0NREGKyk+nr7a97V
L9MkGMo3f6aL/QNwa/1ZbNr+v/NTOGFhSDBAWA3lyTqAURJ2FduZYlhvsHZV
SE1NZA2BCCGeTrpQjlOjS01+eXUZbOMG0u3iiGUEJI7suyMIP8YSzM+Xb4Qw
wsaL1qRL07NgHJTcLtlNc1iQuREUD+lcKdCrKDFQ4t9aEuaPhBmTnOpidfi5
RxoJTMxyVjlpOFDmruanjs2gpp2yodd31zHiZmdy9uw/rntK0z/FjSeYM4Qo
nhtxpqwEc1kM7WEn/TuEIQz8EfQ4bTEoVjGejr6QaQI5zfWEN4Czs2Xr+rJa
QyAT6p128g0g9i2nGcO990EsXEDV8qbH/N5MuuzCr8FP0P4egaVswpvgpQP4
AAxsWRxKTytdey3li20gCyuD6K8urgZRCTd2T9DhjyjMvdTCEx5s0WzRlFM+
ju/kUUJUi806MNFK5RJOpri3nT2V7AgZfydTZtXK8mzK+woqu4KNHSQLgFuK
H0yACPAC8cpZUN6odj2wGNfLlNDn+tHFifSxrQxivS5qBJHRzYxwmcVAQ6Kd
XjpxBI7tuvxXd7To6ZCviHkyBo8aIyAdhmghSo4QgurEJb05EggBGPJLrwx2
Cj1wMbyXJkM3jEIepC/QNF/RYUdDDjEfhZCrTaNlD2fLWp/OoRTWMkYgVUAj
d1U17Us8NIyN2cyblQqz/AR2hefaRNzOEcGtIIbhy0Iz4e9T31eTUyxrIYWk
M480zhqyR3vCqdK76MiMM644lgwwHoAQUat2kOWvmlpsyeDL9owmEFepT8qF
NoVxaO5gf64/dEQ2BmBwWlkNTf9eUJXZ8vO1g0xm8XRsbGGHaAQVqDOOngAI
UfWwV7cstyKhD64AAuzEJNDMKozBl3CSXKilke2SDlMhLRIcDJEZTNAOIS/m
m7yf6mGL/FKQgBXQzaI/xq2SD3BOCOJTRicm8DN+veUCs0IBVcznPiEVtJNe
vUUQAAAA
"
                alt="Valoria Institute host Temitayo Adetokunbo"
                fetchPriority="high"
              />
              <div className="hero-editorial-image-shade" aria-hidden="true" />
              <div className="hero-editorial-caption">
                <span>THE PEOPLE BEHIND THE STANDARD</span>
                <strong>Worth is recognised.<br />Merit is built.</strong>
              </div>
              <div className="valu-card" aria-label="The VALU Index structure">
                <div className="vc-label">THE VALU INDEX</div>
                <div className="vc-score"><span className="vc-num">VALU</span><span className="vc-denom">INDEX</span></div>
                <div className="vc-desig">POINTS-BASED CAPABILITY PROFILE</div>
                <div className="vc-cluster-list"><span>Presence</span><span>Relationships</span><span>Intelligence</span><span>Mastery</span><span>Enterprise</span></div>
                <div className="vc-foot">PRIME framework · results expressed in points</div>
              </div>
            </div>
          </div>
        </div>

        <div className={`hero-slide hero-event-slide ${active === 1 ? 'is-active' : ''}`} aria-hidden={active !== 1}>
          <div className="container hero-inner">
            <div>
              <div className="hero-event-kicker">UPCOMING AT VALORIA</div>
              <h1 className="hero-title">The next conversation<br />on the <em>professional standard.</em></h1>
              <p className="hero-event-copy">The Professional Standard Series brings practical conversations on the capabilities that turn professional performance into recognised opportunity.</p>
              <div className="hero-event-meta">{formatSessionDate(upcomingSession)} · 10:00 AM WAT</div>
              <div className="hero-actions">
                <button type="button" className="btn-gold hero-register-cta" onClick={openRegistration} disabled={!canRegister}>REGISTER FOR THIS CONVERSATION →</button>
                <a href="/events" className="btn-outline">VIEW ALL EVENTS →</a>
              </div>
            </div>
            <aside className="hero-event-panel" aria-label={`Upcoming event: ${upcomingSession.title}`}>
              <div className="hero-event-cluster">{upcomingSession.cluster}</div>
              <h2>{upcomingSession.title}</h2>
              <p>{upcomingSession.description}</p>
              <div className="hero-event-status">{upcomingState === 'coming-soon' ? 'COMING SOON · DATE TO BE CONFIRMED' : formatSessionDate(upcomingSession)}</div>
              {upcomingState !== 'coming-soon' && <SessionTimer session={upcomingSession} />}
            </aside>
          </div>
        </div>
      </div>

      <div className="hero-slider-controls" aria-label="Homepage slides">
        <button type="button" className={`hero-slider-dot ${active === 0 ? 'is-active' : ''}`} onClick={() => goTo(0)} aria-label="Show Valoria introduction slide" aria-pressed={active === 0} />
        <button type="button" className={`hero-slider-dot ${active === 1 ? 'is-active' : ''}`} onClick={() => goTo(1)} aria-label="Show upcoming event slide" aria-pressed={active === 1} />
        <span className="hero-slider-index">0{active + 1} / 02</span>
      </div>
      <div className="hero-scroll-cue" aria-hidden="true"><span>DISCOVER</span><svg width="14" height="8" viewBox="0 0 14 8" fill="none"><path d="M1 1l6 6 6-6" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></div>

      {selectedSession && <EventRegistrationModal session={selectedSession} onClose={() => setSelectedSession(null)} />}
    </section>
  )
}
