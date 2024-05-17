from channels.generic.websocket import AsyncJsonWebsocketConsumer
import json
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from datetime import datetime

class NotificationConsumer(AsyncJsonWebsocketConsumer):
	async def connect(self):
		self.room_name = self.scope['url_route']['kwargs']['username']
		self.room_group_name = 'chat_%s' % self.room_name

		# Join room group
		await self.channel_layer.group_add(
			self.room_group_name,
			self.channel_name
		)
		await self.accept()

	async def disconnect(self, close_code):
		# Leave room group
		await self.channel_layer.group_discard(
			self.room_group_name,
			self.channel_name
		)

	async def receive(self, text_data):
		text_data_json = json.loads(text_data)
		message_type = text_data_json.get('type')

		if message_type == 'friend_request':
			from_user = text_data_json.get('from')
			to_user = text_data_json.get('to')

			if from_user is None or to_user is None:
				return
			# Handle the friend request here
			# You can send a notification to the 'to_user' here

			# Send notification to the 'to_user'
			await self.channel_layer.group_send(
				'chat_%s' % to_user,
				{
					'type': 'notification',
					'message': f"{from_user} t'as envoyé une demande d'ami."
				}
			)

		elif message_type == 'friend_request_accepted':
			from_user = text_data_json.get('from')
			to_user = text_data_json.get('to')

			if from_user is None or to_user is None:
				return

			await self.channel_layer.group_send(
				'chat_%s' % from_user,
				{
					'type': 'notification',
					'message': f"{to_user} a accepté ta demande d'ami."
				}
			)

		elif message_type == 'friend_request_refused':
			from_user = text_data_json.get('from')
			to_user = text_data_json.get('to')

			if from_user is None or to_user is None:
				return

			# Send notification to the 'from_user'
			await self.channel_layer.group_send(
				'chat_%s' % from_user,
				{
					'type': 'notification',
					'message': f"{to_user} a refusé ta demande d'ami"
				}
			)

		elif message_type == 'friend_deleted':
			from_user = text_data_json.get('from')
			to_user = text_data_json.get('to')

			if from_user is None or to_user is None:
				return
			await self.channel_layer.group_send(
				'chat_%s' % from_user,
				{
					'type': 'notification',
					'message': f"{to_user} a supprimé votre amitié 😔"
				}
			)

		elif message_type == 'chat_message':
			message = text_data_json.get('message')

			# Send message to room group
			await self.channel_layer.group_send(
				self.room_group_name,
				{
					'type': 'chat_message',
					'message': message
				}
			)

	async def chat_message(self, event):
		message = event['message']

		# Send message to WebSocket
		await self.send(text_data=json.dumps({
			'message': message
		}))

	async def notification(self, event):
		message = event['message']

		# Send message to WebSocket
		await self.send(text_data=json.dumps({
			'type': 'notification', # Add this line to differentiate between 'chat_message' and 'notification
			'message': message
		}))