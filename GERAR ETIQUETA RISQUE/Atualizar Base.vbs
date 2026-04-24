Dim sRaiz, sExcel, sJS

sRaiz  = Left(WScript.ScriptFullName, InStrRev(WScript.ScriptFullName, "\"))
sExcel = sRaiz & "ferramentas\Base.xlsb"
sJS    = sRaiz & "ferramentas\base_dados.js"

Dim oFS
Set oFS = CreateObject("Scripting.FileSystemObject")

If Not oFS.FileExists(sExcel) Then
    MsgBox "Arquivo Base.xlsb nao encontrado!" & vbCrLf & vbCrLf & "Verifique se o arquivo esta em:" & vbCrLf & sExcel, vbCritical, "Atualizar Base - Erro"
    WScript.Quit
End If

Dim resposta
resposta = MsgBox("Deseja atualizar a base de dados agora?" & vbCrLf & vbCrLf & "ATENCAO:" & vbCrLf & "- O SAP precisa estar aberto e logado." & vbCrLf & "- Feche o arquivo Base.xlsb antes de continuar.", vbYesNo + vbQuestion, "Atualizar Base")

If resposta = vbNo Then
    WScript.Quit
End If

Dim oXL, oWB, oWS
On Error Resume Next

Set oXL = CreateObject("Excel.Application")
If Err.Number <> 0 Then
    MsgBox "Nao foi possivel abrir o Excel. Verifique se o Excel esta instalado.", vbCritical, "Atualizar Base - Erro"
    WScript.Quit
End If
On Error GoTo 0

oXL.Visible = False
oXL.DisplayAlerts = False

Set oWB = oXL.Workbooks.Open(sExcel)

On Error Resume Next
oXL.Run "ChamarZMM077"
If Err.Number <> 0 Then
    oWB.Close False
    oXL.Quit
    MsgBox "Erro ao executar a macro do SAP." & vbCrLf & vbCrLf & "Verifique se:" & vbCrLf & "- O SAP esta aberto e logado" & vbCrLf & "- O Base.xlsb nao esta aberto por outro usuario", vbCritical, "Atualizar Base - Erro"
    WScript.Quit
End If
On Error GoTo 0

Set oWS = oWB.Sheets(1)

Dim lastRow, lastCol
lastRow = oWS.UsedRange.Rows.Count
lastCol = oWS.UsedRange.Columns.Count

Dim headers()
ReDim headers(lastCol - 1)
Dim c
For c = 1 To lastCol
    headers(c - 1) = Trim(oWS.Cells(1, c).Value)
Next

Dim colZUI
colZUI = -1
For c = 0 To lastCol - 1
    If headers(c) = "ZUI" Then
        colZUI = c + 1
        Exit For
    End If
Next

Dim jsonStr, r, campo, valor, temZUI
jsonStr = "var BASE_DADOS = [" & vbCrLf

Dim primeiroItem
primeiroItem = True

For r = 2 To lastRow
    temZUI = True
    If colZUI > 0 Then
        If Trim(oWS.Cells(r, colZUI).Value) = "" Then
            temZUI = False
        End If
    End If

    If temZUI Then
        If Not primeiroItem Then
            jsonStr = jsonStr & "," & vbCrLf
        End If
        primeiroItem = False

        jsonStr = jsonStr & "  {" & vbCrLf
        For c = 1 To lastCol
            campo = headers(c - 1)
            valor = Trim(oWS.Cells(r, c).Value)
            valor = Replace(valor, "\", "\\")
            valor = Replace(valor, """", "\""")
            If c < lastCol Then
                jsonStr = jsonStr & "    """ & campo & """: """ & valor & """," & vbCrLf
            Else
                jsonStr = jsonStr & "    """ & campo & """: """ & valor & """" & vbCrLf
            End If
        Next
        jsonStr = jsonStr & "  }"
    End If
Next

jsonStr = jsonStr & vbCrLf & "];" & vbCrLf

Dim oFile
Set oFile = oFS.CreateTextFile(sJS, True, True)
oFile.Write jsonStr
oFile.Close

oWB.Save
oWB.Close False
oXL.Quit

Set oFile = Nothing
Set oFS   = Nothing
Set oWS   = Nothing
Set oWB   = Nothing
Set oXL   = Nothing

MsgBox "Base atualizada com sucesso!" & vbCrLf & vbCrLf & "Recarregue o site para usar a nova base." & vbCrLf & "(Pressione F5 no navegador)", vbInformation, "Atualizar Base - Concluido"
