"""
Асинхронный сервис расчёта общего потребления (TotalPower) для заявки.
Принимает POST с consumption_id и списком usecases, через 5–10 сек считает
сумму (consumption * duration) по формуле и отправляет PUT на основной сервис.
"""
import os
import random
import time
import requests
from concurrent import futures
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

# URL основного сервиса для callback (обновление total_power)
CALLBACK_URL = os.environ.get('CALLBACK_URL', 'http://127.0.0.1:8000').rstrip('/')
# Токен для псевдо-авторизации при внесении результата (8 байт = строка)
RESULT_TOKEN = os.environ.get('RESULT_TOKEN', 'a1b2c3d4')

executor = futures.ThreadPoolExecutor(max_workers=2)


def calculate_total_power_sync(consumption_id: int, usecases: list) -> dict:
    """
    Имитация долгого расчёта (5–10 сек), затем расчёт по формуле:
    total_power = sum(consumption * duration) по всем usecases.
    usecases: [ {"consumption": uint, "duration": uint}, ... ]
    """
    delay_sec = 5 + random.uniform(0, 5)  # 5–10 секунд
    time.sleep(delay_sec)

    total = 0
    for uc in usecases:
        cons = int(uc.get('consumption', 0) or 0)
        dur = int(uc.get('duration', 0) or 0)
        total += cons * dur

    return {
        'id': consumption_id,
        'total_power': total,
    }


def result_callback(task):
    """После завершения задачи отправляет PUT на основной сервис с токеном."""
    try:
        result = task.result()
    except futures._base.CancelledError:
        return

    url = f"{CALLBACK_URL}/api/consumptions/{result['id']}/result"
    payload = {
        'token': RESULT_TOKEN,
        'total_power': result['total_power'],
    }
    try:
        requests.put(url, json=payload, timeout=10)
    except Exception as e:
        print(f"Callback error: {e}")


@api_view(['POST'])
def calculate_total_power(request):
    """
    POST: { "consumption_id": int, "usecases": [ {"consumption": int, "duration": int}, ... ] }
    Сразу возвращает 200, расчёт выполняется в фоне; по завершении результат отправляется на основной сервис.
    """
    consumption_id = request.data.get('consumption_id')
    usecases = request.data.get('usecases')

    if consumption_id is None or not isinstance(usecases, list):
        return Response(
            {'error': 'consumption_id and usecases (array) required'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        cid = int(consumption_id)
    except (TypeError, ValueError):
        return Response({'error': 'consumption_id must be integer'}, status=status.HTTP_400_BAD_REQUEST)

    task = executor.submit(calculate_total_power_sync, cid, usecases)
    task.add_done_callback(result_callback)
    return Response(status=status.HTTP_200_OK)
